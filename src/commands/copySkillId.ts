import * as vscode from 'vscode';
import { SkillItem } from '../skillsTreeProvider';

type CopyIdArg = string | SkillItem | undefined;

export function registerCopyIdCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.copyId',
    async (item?: CopyIdArg) => {
      // Handle both direct string argument and tree item context menu invocation
      let skillId: string | undefined;

      if (typeof item === 'string') {
        skillId = item;
      } else if (item instanceof SkillItem) {
        skillId = item.skill.id;
      }

      if (!skillId) {
        return;
      }

      const command = `/${skillId}`;
      await vscode.env.clipboard.writeText(command);
      vscode.window.showInformationMessage(
        `${command} copied to clipboard`
      );
    }
  );
}
