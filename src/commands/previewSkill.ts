import * as vscode from 'vscode';
import { SkillsManager } from '../skillsManager';

export function registerPreviewCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.preview',
    async (skillId?: string | any) => {
      // VS Code may pass the SkillItem tree node instead of the string id
      let resolvedId: string | undefined;
      if (typeof skillId === 'string') {
        resolvedId = skillId;
      } else if (skillId?.skill?.id) {
        resolvedId = skillId.skill.id;
      } else if (skillId?.id && typeof skillId.id === 'string') {
        resolvedId = skillId.id;
      }

      if (!resolvedId) {
        const picked = await vscode.window.showQuickPick(
          manager.getAll().map(s => ({ label: s.id, description: s.description })),
          { placeHolder: 'Preview skill…' }
        );
        if (!picked) {
          return;
        }
        resolvedId = picked.label;
      }

      const skill = manager.findById(resolvedId);
      if (!skill) {
        vscode.window.showErrorMessage(
          `AI Skills: Skill '${resolvedId}' not found.`
        );
        return;
      }

      const filePath = manager.contentPath(skill);
      try {
        await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
          viewColumn: vscode.ViewColumn.Beside,
          preview: true,
          preserveFocus: true,
        });
      } catch {
        vscode.window.showErrorMessage(
          `AI Skills: Could not open SKILL.md for '${resolvedId}'.`
        );
      }
    }
  );
}
