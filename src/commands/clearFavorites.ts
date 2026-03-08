import * as vscode from 'vscode';
import { FavoriteSkills } from '../favoriteSkills';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';

export function registerClearFavoritesCommand(
  favorites: FavoriteSkills,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.clearFavorites', async () => {
    const count = favorites.get().length;
    if (count === 0) {
      vscode.window.showInformationMessage('AI Skills: No favorites to clear.');
      return;
    }

    const answer = await vscode.window.showWarningMessage(
      `Remove all ${count} skill(s) from favorites?`,
      { modal: true },
      'Clear All'
    );
    if (answer !== 'Clear All') { return; }

    favorites.clear();
    treeProvider.refresh();
    vscode.window.showInformationMessage('AI Skills: Favorites cleared.');
  });
}
