import * as vscode from 'vscode';
import { SkillsManager } from './skillsManager';
import { SkillsTreeProvider } from './skillsTreeProvider';
import { registerBrowseCommand } from './commands/browseSkills';
import { registerInstallCommand, registerInstallFromTreeCommand } from './commands/installSkill';
import { registerPreviewCommand } from './commands/previewSkill';
import { registerCopyIdCommand } from './commands/copySkillId';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const manager = new SkillsManager(context);
  const healthy = await manager.init();

  if (!healthy) {
    vscode.window.showWarningMessage(
      'AI Agent Skills: Asset bundle is incomplete or missing. ' +
      'Try reinstalling the extension.'
    );
  }

  const treeProvider = new SkillsTreeProvider(manager);
  const treeView = vscode.window.createTreeView('aiSkillsTree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    treeView,
    registerBrowseCommand(manager),
    registerInstallCommand(manager),
    registerInstallFromTreeCommand(manager),
    registerPreviewCommand(manager),
    registerCopyIdCommand(),
    vscode.commands.registerCommand('aiSkills.refreshTree', async () => {
      await manager.init();
      treeProvider.refresh();
    })
  );
}

export function deactivate(): void { }
