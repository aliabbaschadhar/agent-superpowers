import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from '../skillsManager';

function toQuickPickItem(
  skill: SkillEntry,
  showRisk: boolean
): vscode.QuickPickItem {
  return {
    label: `$(symbol-event) /${skill.id}`,
    description:
      skill.category !== 'uncategorized' ? skill.category : undefined,
    detail:
      (showRisk && skill.risk !== 'unknown' ? `[${skill.risk}] ` : '') +
      skill.description,
  };
}

export function registerBrowseCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.browse', async () => {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const showRisk = config.get<boolean>('showRiskBadge', true);
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showErrorMessage(
        'AI Skills: No skills loaded. The extension bundle may be corrupted.'
      );
      return;
    }

    const picked = await vscode.window.showQuickPick(
      skills.map(s => toQuickPickItem(s, showRisk)),
      {
        placeHolder: `Search ${skills.length} AI skills by ID or description…`,
        matchOnDetail: true,
        matchOnDescription: true,
      }
    );

    if (!picked) {
      return;
    }

    // Extract skill id from label like "$(symbol-event) /skill-id"
    const skillId = picked.label.replace(/^\$\([^)]+\)\s*\//, '');
    const command = `/${skillId}`;

    await vscode.env.clipboard.writeText(command);

    // Try to focus Claude Code chat and auto-paste. Fall back gracefully.
    let pasted = false;
    for (const focusCmd of [
      'claude.focusChat',
      'workbench.view.extension.claude-code',
    ]) {
      try {
        await vscode.commands.executeCommand(focusCmd);
        pasted = true;
        break;
      } catch {
        // try next
      }
    }

    if (pasted) {
      await new Promise(r => setTimeout(r, 120));
      try {
        await vscode.commands.executeCommand(
          'editor.action.clipboardPasteAction'
        );
      } catch {
        pasted = false;
      }
    }

    vscode.window.showInformationMessage(
      pasted
        ? `${command} sent to chat`
        : `${command} copied to clipboard — paste with Ctrl+V`
    );
  });
}
