import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillUpdateTracker } from '../skills/SkillUpdateTracker';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';
import { bulkInstall } from './installBulk';

export function registerUpdateAllSkillsCommand(
  manager: SkillsManager,
  tracker: SkillUpdateTracker,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.updateAll', async () => {
    const outdated = await manager.getSkillsWithUpdates(tracker);

    if (outdated.length === 0) {
      vscode.window.showInformationMessage('AI Skills: All installed skills are up to date. ✓');
      return;
    }

    const choicePick = await vscode.window.showInformationMessage(
      `AI Skills: ${outdated.length} installed skill(s) have updates available.`,
      { modal: false },
      'Update All',
      'Review'
    );

    if (!choicePick) { return; }

    let toUpdate = outdated;

    if (choicePick === 'Review') {
      const items = outdated.map(s => ({
        label: `$(arrow-up) /${s.id}`,
        description: s.category,
        detail: s.description,
        picked: true,
        skillId: s.id,
      }));
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select skills to update…',
        canPickMany: true,
      });
      if (!selected || selected.length === 0) { return; }
      toUpdate = selected.map(i => manager.findById(i.skillId)!).filter(Boolean);
    }

    await bulkInstall(toUpdate, `${toUpdate.length} outdated skill(s)`, manager);

    // After updating, re-hash all updated skills
    for (const skill of toUpdate) {
      const content = await manager.readContent(skill);
      if (content) {
        tracker.setHash(skill.id, content);
      }
    }

    treeProvider.refreshAfterInstall();

    // Clear the "updates available" context key
    const remaining = await manager.getSkillsWithUpdates(tracker);
    vscode.commands.executeCommand('setContext', 'aiSkills.updatesAvailable', remaining.length > 0);
  });
}
