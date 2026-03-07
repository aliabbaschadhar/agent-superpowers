import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from '../skills/SkillsManager';
import { ERR_NO_SKILLS } from '../constants';
import { RecentSkills } from '../recentSkills';
import { FavoriteSkills } from '../favoriteSkills';
import { FuzzySearch } from '../skills/FuzzySearch';
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
  showRisk: boolean,
  isFavorite = false
): vscode.QuickPickItem {
  return {
    label: isFavorite ? `$(star-full) /${skill.id}` : `$(symbol-event) /${skill.id}`,
    description:
      skill.category !== 'uncategorized' ? skill.category : undefined,
    detail:
      (showRisk && skill.risk !== 'unknown' ? `[${skill.risk}] ` : '') +
      skill.description,
  };
}

export function registerBrowseCommand(
  manager: SkillsManager,
  recentSkills: RecentSkills,
  favoriteSkills: FavoriteSkills
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.browse', async () => {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const showRisk = config.get<boolean>('showRiskBadge', true);
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showErrorMessage(ERR_NO_SKILLS);
      return;
    }

    const fuzzy = new FuzzySearch(skills);

    function buildItems(query: string): vscode.QuickPickItem[] {
      if (!query) {
        const favIds = favoriteSkills.get();
        const favEntries = favIds
          .map(id => manager.findById(id))
          .filter((s): s is SkillEntry => s !== undefined);

        const recentIds = recentSkills.get();
        const recentEntries = recentIds
          .map(id => manager.findById(id))
          .filter((s): s is SkillEntry => s !== undefined);

        return [
          ...(favEntries.length > 0
            ? [
              { label: '⭐ Favorites', kind: vscode.QuickPickItemKind.Separator },
              ...favEntries.map(s => toQuickPickItem(s, showRisk, true)),
            ]
            : []),
          ...(recentEntries.length > 0
            ? [
              { label: 'Recently Used', kind: vscode.QuickPickItemKind.Separator },
              ...recentEntries.map(s => toQuickPickItem(s, showRisk, favoriteSkills.has(s.id))),
            ]
            : []),
          { label: 'All Skills', kind: vscode.QuickPickItemKind.Separator },
          ...skills.map(s => toQuickPickItem(s, showRisk, favoriteSkills.has(s.id))),
        ];
      }

      if (FuzzySearch.isTagQuery(query)) {
        const tag = query.slice(1);
        const results = fuzzy.searchByTag(query);
        return [
          {
            label: `$(tag) #${tag} — ${results.length} skill(s)`,
            kind: vscode.QuickPickItemKind.Separator,
          },
          ...results.map(s => toQuickPickItem(s, showRisk, favoriteSkills.has(s.id))),
        ];
      }

      // Fuzzy text search — sorted by relevance
      const results = fuzzy.search(query);
      return results.map(s => toQuickPickItem(s, showRisk, favoriteSkills.has(s.id)));
    }

    const qp = vscode.window.createQuickPick();
    qp.placeholder = `Search ${skills.length} AI skills by ID, description, or #tag…`;
    qp.matchOnDetail = false;
    qp.matchOnDescription = false;
    qp.items = buildItems('');

    qp.onDidChangeValue(value => {
      qp.items = buildItems(value.trim().toLowerCase());
    });

    qp.show();

    await new Promise<void>(resolve => {
      qp.onDidAccept(async () => {
        const picked = qp.selectedItems[0];
        qp.hide();
        resolve();

        if (!picked || picked.kind === vscode.QuickPickItemKind.Separator) {
          return;
        }

        // Strip icon prefix: "$(star-full) /skill-id" or "$(symbol-event) /skill-id"
        const skillId = picked.label.replace(/\$\([^)]+\)\s*\//, '');
        const command = `/${skillId}`;

        recentSkills.add(skillId);

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

      qp.onDidHide(() => resolve());
    });

    qp.dispose();
  });
}
