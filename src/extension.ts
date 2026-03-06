import * as vscode from 'vscode';
import { SkillsManager } from './skillsManager';
import { SkillsTreeProvider } from './skillsTreeProvider';
import { registerBrowseCommand } from './commands/browseSkills';
import { registerInstallCommand, registerInstallFromTreeCommand } from './commands/installSkill';
import { registerPreviewCommand } from './commands/previewSkill';
import { registerCopyIdCommand } from './commands/copySkillId';
import { registerUninstallCommand } from './commands/uninstallSkill';
import { ERR_BUNDLE_INCOMPLETE } from './constants';
import { initLogger, log } from './logger';
import { RecentSkills } from './recentSkills';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  initLogger(context);
  log('Extension activating…');

  const manager = new SkillsManager(context);
  const healthy = await manager.init();

  if (!healthy) {
    vscode.window.showWarningMessage(ERR_BUNDLE_INCOMPLETE);
  } else {
    log(`Skills loaded: ${manager.getAll().length}`);
  }

  const recentSkills = new RecentSkills(context);

  const treeProvider = new SkillsTreeProvider(manager);
  const treeView = vscode.window.createTreeView('aiSkillsTree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // Background remote sync — refresh tree only when new skills are found
  manager.syncRemote().then(added => {
    if (added > 0) { treeProvider.refresh(); }
  }).catch(() => { /* ignore network errors */ });

  context.subscriptions.push(
    treeView,
    registerBrowseCommand(manager, recentSkills),
    registerInstallCommand(manager, recentSkills),
    registerInstallFromTreeCommand(manager),
    registerPreviewCommand(manager),
    registerCopyIdCommand(),
    registerUninstallCommand(manager),
    vscode.commands.registerCommand('aiSkills.refreshTree', async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Syncing AI Skills…',
        },
        async () => {
          const added = await manager.syncRemote();
          treeProvider.refresh();
          if (added > 0) {
            vscode.window.showInformationMessage(`AI Skills: Found ${added} new skill(s)!`);
          }
        }
      );
    }),
    vscode.commands.registerCommand('aiSkills.filterTree', async () => {
      const text = await vscode.window.showInputBox({
        placeHolder: 'Filter skills by name or description… (leave empty to clear)',
        prompt: 'Filter the skills tree',
      });
      if (text === undefined) { return; } // user pressed Escape
      treeProvider.setFilter(text);
      if (text.trim()) {
        vscode.window.showInformationMessage(`AI Skills: Showing results for "${text}"`);
      }
    }),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('aiSkills.localSkillsPath')) {
        manager.loadLocalSources();
        treeProvider.refresh();
      }
    })
  );

  // First-run welcome notification
  const welcomed = context.globalState.get<boolean>('aiSkills.welcomed', false);
  if (!welcomed && healthy) {
    context.globalState.update('aiSkills.welcomed', true);
    const action = await vscode.window.showInformationMessage(
      `AI Agent Skills: ${manager.getAll().length} skills ready. Press Ctrl+Shift+/ to browse, or open the sidebar.`,
      'Browse Skills',
      'Dismiss'
    );
    if (action === 'Browse Skills') {
      vscode.commands.executeCommand('aiSkills.browse');
    }
  }
}

export function deactivate(): void { }
