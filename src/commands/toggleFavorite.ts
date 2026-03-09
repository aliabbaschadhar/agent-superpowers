import * as vscode from 'vscode';
import { FavoriteSkills } from '../favoriteSkills';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';
import { SkillItem } from '../tree/nodes';

/**
 * Registers the `aiSkills.toggleFavorite` command.
 *
 * Can be invoked from:
 * - Tree context menu (receives a `SkillItem` argument)
 * - Command palette after querying a skill ID
 * - Programmatically with a plain skill ID string
 */
export function registerToggleFavoriteCommand(
  favoriteSkills: FavoriteSkills,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.toggleFavorite',
    (item: SkillItem | string | undefined) => {
      let skillId: string | undefined;

      if (item instanceof SkillItem) {
        skillId = item.skill.id;
      } else if (typeof item === 'string') {
        skillId = item;
      }

      if (!skillId) {
        vscode.window.showErrorMessage('AI Skills: No skill selected to favorite.');
        return;
      }

      const isNowFavorited = favoriteSkills.toggle(skillId);
      treeProvider.refresh();

      if (isNowFavorited) {
        vscode.window.showInformationMessage(`$(star-full) "${skillId}" added to Favorites.`);
      } else {
        vscode.window.showInformationMessage(`$(star-empty) "${skillId}" removed from Favorites.`);
      }
    }
  );
}
