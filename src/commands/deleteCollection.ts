import * as vscode from 'vscode';
import { UserCollections } from '../skills/UserCollections';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';

export function registerDeleteCollectionCommand(
  userCollections: UserCollections,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.deleteCollection',
    async (item?: { collectionId: string; collectionName: string }) => {
      let collectionId: string | undefined = item?.collectionId;
      let collectionName: string | undefined = item?.collectionName;

      if (!collectionId) {
        const all = userCollections.getAll();
        if (all.length === 0) {
          vscode.window.showInformationMessage('AI Skills: No custom collections to delete.');
          return;
        }
        const pick = await vscode.window.showQuickPick(
          all.map(c => ({ label: c.name, description: `${c.skillIds.length} skills`, id: c.id })),
          { placeHolder: 'Select collection to delete…' }
        );
        if (!pick) { return; }
        collectionId = pick.id;
        collectionName = pick.label;
      }

      const answer = await vscode.window.showWarningMessage(
        `Delete collection "${collectionName ?? collectionId}"? This cannot be undone.`,
        { modal: true },
        'Delete'
      );
      if (answer !== 'Delete') { return; }

      userCollections.delete(collectionId);
      treeProvider.refresh();
      vscode.window.showInformationMessage('AI Skills: Collection deleted.');
    }
  );
}
