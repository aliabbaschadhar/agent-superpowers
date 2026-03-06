import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from '../skillsManager';
import { ERR_NO_SKILLS } from '../constants';
import { RecentSkills } from '../recentSkills';
import { recommendedAgent } from '../editorDetector';

/**
 * Returns the VS Code command IDs to attempt, in order, for focusing the
 * active AI-chat input panel. Ordered from most-specific to generic fallback.
 */
function getChatFocusCommands(agent: string): string[] {
  switch (agent) {
    case 'claude':
      return [
        'claude.focusChat',
        'workbench.view.extension.claude-code',
        'workbench.action.chat.open',
      ];
    case 'gemini':
      return [
        'gemini.focusChat',
        'workbench.view.extension.gemini',
        'workbench.action.chat.open',
      ];
    case 'copilot':
      return [
        'workbench.action.chat.open',
        'workbench.panel.chat.view.copilot.focus',
        'github.copilot.chat.focus',
      ];
    case 'cursor':
      return [
        'aichat.newchataction',
        'workbench.action.chat.open',
      ];
    default:
      return [
        'workbench.action.chat.open',
        'claude.focusChat',
        'workbench.view.extension.claude-code',
      ];
  }
}

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
  manager: SkillsManager,
  recentSkills: RecentSkills
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.browse', async () => {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const showRisk = config.get<boolean>('showRiskBadge', true);
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showErrorMessage(ERR_NO_SKILLS);
      return;
    }

    // Build QuickPick items: recently used section at top, then all skills
    const recentIds = recentSkills.get();
    const recentEntries = recentIds
      .map(id => manager.findById(id))
      .filter((s): s is SkillEntry => s !== undefined);

    const allItems: vscode.QuickPickItem[] = [
      ...(recentEntries.length > 0
        ? [
          { label: 'Recently Used', kind: vscode.QuickPickItemKind.Separator },
          ...recentEntries.map(s => toQuickPickItem(s, showRisk)),
          { label: 'All Skills', kind: vscode.QuickPickItemKind.Separator },
        ]
        : []),
      ...skills.map(s => toQuickPickItem(s, showRisk)),
    ];

    const picked = await vscode.window.showQuickPick(allItems, {
      placeHolder: `Search ${skills.length} AI skills by ID or description…`,
      matchOnDetail: true,
      matchOnDescription: true,
    });

    if (!picked || picked.kind === vscode.QuickPickItemKind.Separator) {
      return;
    }

    // Extract skill id from label like "$(symbol-event) /skill-id"
    const skillId = picked.label.replace(/^\$\([^)]+\)\s*\//, '');
    const command = `/${skillId}`;

    recentSkills.add(skillId);

    // Try VS Code's chat framework API first.
    // workbench.action.chat.open with isPartialQuery:true places text in the
    // chat input WITHOUT submitting — Claude Code integrates with this API.
    let sent = false;
    try {
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: command,
        isPartialQuery: true,
      });
      sent = true;
    } catch {
      // Not available — fall through to focus-then-paste
    }

    if (!sent) {
      // Fallback: focus the active AI-chat panel using agent-specific commands.
      const agent = recommendedAgent();
      const focusCmds = getChatFocusCommands(agent);

      for (const focusCmd of focusCmds) {
        try {
          await vscode.commands.executeCommand(focusCmd);
          break;
        } catch {
          // try next
        }
      }
    }

    if (!sent) {
      vscode.window.showWarningMessage(
        `$(symbol-event) Could not send ${command} to chat — AI chat panel not found.`
      );
    }
  });
}
