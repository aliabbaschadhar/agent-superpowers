import * as vscode from 'vscode';
import { createSkillsManager } from './skills/SkillsManager';
import { SkillsTreeProvider } from './tree/SkillsTreeProvider';
import { registerBrowseCommand } from './commands/browseSkills';
import { registerInstallCommand, registerInstallFromTreeCommand } from './commands/installSkill';
import { registerPreviewCommand } from './commands/previewSkill';
import { registerCopyIdCommand } from './commands/copySkillId';
import { registerUninstallCommand, registerUninstallAllCommand } from './commands/uninstallSkill';
import { registerBulkCopySkillsCommand } from './commands/bulkCopySkills';
import { registerInstallCategoryCommand, registerInstallAllCommand } from './commands/installBulk';
import { registerBrowseCollectionsCommand } from './commands/browseCollections';
import { registerCreateSkillCommand } from './commands/createSkill';
import { registerExportSkillSetCommand, registerImportSkillSetCommand } from './commands/exportImportSkillSet';
import { registerToggleFavoriteCommand } from './commands/toggleFavorite';
import { ERR_BUNDLE_INCOMPLETE, CMD_FILTER_TREE } from './constants';
import { WorkspaceScanner } from './skills/WorkspaceScanner';
import { initLogger, log } from './logger';
import { RecentSkills } from './recentSkills';
import { FavoriteSkills } from './favoriteSkills';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  initLogger(context);
  log('Extension activating…');

  const manager = createSkillsManager(context);
  const healthy = await manager.init();

  if (!healthy) {
    vscode.window.showWarningMessage(ERR_BUNDLE_INCOMPLETE);
  } else {
    log(`Skills loaded: ${manager.getAll().length}`);
  }

  const recentSkills = new RecentSkills(context);
  const favoriteSkills = new FavoriteSkills(context);
  const welcomed = context.globalState.get<boolean>('aiSkills.welcomed', false);

  const treeProvider = new SkillsTreeProvider(manager, favoriteSkills, !welcomed);
  const treeView = vscode.window.createTreeView('aiSkillsTree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // Project-aware recommendations
  const scanner = new WorkspaceScanner();
  const runRecommendations = async (): Promise<void> => {
    const techs = await scanner.scan();
    if (techs.length > 0) {
      const recommended = manager.getRecommended(techs);
      treeProvider.setRecommendations(recommended, techs);
    }
  };
  runRecommendations().catch(() => { /* silent — non-critical feature */ });
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      runRecommendations().catch(() => { /* ignore */ });
    })
  );

  // Background remote sync — refresh tree only when new skills are found
  manager.syncRemote().then(added => {
    if (added > 0) { treeProvider.refresh(); }
  }).catch(() => { /* ignore network errors */ });

  context.subscriptions.push(
    treeView,
    registerBrowseCommand(manager, recentSkills, favoriteSkills),
    registerInstallCommand(manager, recentSkills),
    registerInstallFromTreeCommand(manager),
    registerPreviewCommand(manager),
    registerCopyIdCommand(),
    registerUninstallCommand(manager),
    registerUninstallAllCommand(manager, treeProvider),
    registerBulkCopySkillsCommand(manager),
    registerInstallCategoryCommand(manager),
    registerInstallAllCommand(manager, treeProvider),
    registerToggleFavoriteCommand(favoriteSkills, treeProvider),
    registerBrowseCollectionsCommand(manager),
    registerCreateSkillCommand(manager),
    registerExportSkillSetCommand(manager),
    registerImportSkillSetCommand(manager),
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
    vscode.commands.registerCommand(CMD_FILTER_TREE, () => {
      treeProvider.toggleInstalledFilter();
    }),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('aiSkills.localSkillsPath')) {
        manager.loadLocalSources();
        treeProvider.refresh();
      }
    })
  );

  // First-run welcome notification
  const showWelcome = async (): Promise<void> => {
    context.globalState.update('aiSkills.welcomed', true);
    const action = await vscode.window.showInformationMessage(
      `AI Agent Skills: ${manager.getAll().length} skills ready. Press Ctrl+Shift+/ to browse, or open the sidebar.`,
      'Browse Skills',
      'Dismiss'
    );
    if (action === 'Browse Skills') {
      vscode.commands.executeCommand('aiSkills.browse');
    }
  };

  if (!welcomed && healthy) {
    showWelcome().catch(() => { /* ignore */ });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('aiSkills.showWelcome', () => {
      context.globalState.update('aiSkills.welcomed', false);
      showWelcome().catch(() => { /* ignore */ });
    })
  );
}

export function deactivate(): void { }
