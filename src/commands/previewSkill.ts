import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { ERR_SKILL_NOT_FOUND, ERR_OPEN_FILE } from '../constants';

/** Argument shapes that VSCode may pass to the preview command */
type SkillArgument = string | { skill: { id: string } } | { id: string } | undefined;

export function registerPreviewCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.preview', async (arg?: SkillArgument) => {
    // VS Code may pass the SkillItem tree node instead of the string id
    let resolvedId: string | undefined;
    if (typeof arg === 'string') {
      resolvedId = arg;
    } else if (arg && typeof arg === 'object' && 'skill' in arg) {
      resolvedId = arg.skill.id;
    } else if (arg && typeof arg === 'object' && 'id' in arg && typeof arg.id === 'string') {
      resolvedId = arg.id;
    }

    if (!resolvedId) {
      const picked = await vscode.window.showQuickPick(
        manager.getAll().map((s) => ({ label: s.id, description: s.description })),
        { placeHolder: 'Preview skill…' }
      );
      if (!picked) {
        return;
      }
      resolvedId = picked.label;
    }

    const skill = manager.findById(resolvedId);
    if (!skill) {
      vscode.window.showErrorMessage(ERR_SKILL_NOT_FOUND(resolvedId));
      return;
    }

    // Ensure content is fetched (downloads if missing)
    await manager.readContent(skill);
    const filePath = manager.contentPath(skill);
    try {
      await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        viewColumn: vscode.ViewColumn.Beside,
        preview: true,
        preserveFocus: true,
      });
    } catch {
      vscode.window.showErrorMessage(ERR_OPEN_FILE(resolvedId));
    }
  });
}
