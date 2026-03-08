import * as vscode from 'vscode';
import { UserCollections } from '../skills/UserCollections';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';

export function registerAddToCollectionCommand(
  manager: SkillsManager,
  userCollections: UserCollections,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.addToCollection',
    async (item?: { skill: { id: string } } | string) => {
      let skillId: string | undefined;

      if (item && typeof item === 'object' && 'skill' in item) {
        skillId = item.skill.id;
      } else if (typeof item === 'string') {
        skillId = item;
      }

      if (!skillId) {
        const skills = manager.getAll();
        const picked = await vscode.window.showQuickPick(
          skills.map(s => ({ label: `/${s.id}`, description: s.category, detail: s.description })),
          { placeHolder: 'Select skill to add to a collection…', matchOnDetail: true }
        );
        if (!picked) { return; }
        skillId = picked.label.slice(1); // strip leading /
      }

      const all = userCollections.getAll();
      if (all.length === 0) {
        const create = await vscode.window.showInformationMessage(
          'No custom collections yet. Create one first?',
          'Create Collection'
        );
        if (create === 'Create Collection') {
          await vscode.commands.executeCommand('aiSkills.createCollection');
        }
        return;
      }

      const collectionPick = await vscode.window.showQuickPick(
        all.map(c => ({
          label: `$(${c.icon}) ${c.name}`,
          description: `${c.skillIds.length} skills`,
          id: c.id,
          hasSkill: c.skillIds.includes(skillId!),
        })),
        { placeHolder: `Add "/${skillId}" to which collection?` }
      );
      if (!collectionPick) { return; }

      if (collectionPick.hasSkill) {
        vscode.window.showInformationMessage(
          `AI Skills: "${skillId}" is already in "${collectionPick.label.replace(/\$\([^)]+\)\s*/, '')}".`
        );
        return;
      }

      userCollections.addSkill(collectionPick.id, skillId);
      treeProvider.refresh();
      vscode.window.showInformationMessage(
        `AI Skills: Added "/${skillId}" to collection.`
      );
    }
  );
}

export function registerRemoveFromCollectionCommand(
  userCollections: UserCollections,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.removeFromCollection',
    async (item?: { skill: { id: string }; collectionId: string }) => {
      if (!item?.skill?.id || !item?.collectionId) {
        vscode.window.showErrorMessage('AI Skills: Use this command from the skill context menu.');
        return;
      }

      userCollections.removeSkill(item.collectionId, item.skill.id);
      treeProvider.refresh();
      vscode.window.showInformationMessage(`AI Skills: Removed "/${item.skill.id}" from collection.`);
    }
  );
}
