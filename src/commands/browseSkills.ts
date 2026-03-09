import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from '../skills/SkillsManager';
import { ERR_NO_SKILLS } from '../constants';
import { RecentSkills } from '../recentSkills';
import { FavoriteSkills } from '../favoriteSkills';
import { FuzzySearch } from '../skills/FuzzySearch';
import { ProjectLocalInstaller } from '../installers/projectLocalInstaller';
import { InstallOptions } from '../installers/types';

/**
 * Parses special filter prefixes from browse query text.
 * Supported:
 *  /cat:ai      /cat:security
 *  /installed
 *
 * Returns the remaining query text and any active filters.
 */
interface BrowseFilters {
  category?: string;
  installedOnly?: boolean;
  query: string;
}

function parseFilters(raw: string): BrowseFilters {
  let text = raw;
  const filters: BrowseFilters = { query: '' };

  // /cat:<category>
  const catMatch = text.match(/\/cat:([^\s]+)/i);
  if (catMatch) {
    filters.category = catMatch[1].toLowerCase();
    text = text.replace(catMatch[0], '');
  }

  // /installed
  if (/\/installed\b/i.test(text)) {
    filters.installedOnly = true;
    text = text.replace(/\/installed\b/i, '');
  }

  filters.query = text.trim().toLowerCase();
  return filters;
}

function applyFilters(
  skills: SkillEntry[],
  filters: BrowseFilters,
  manager: SkillsManager
): SkillEntry[] {
  let result = skills;
  if (filters.category) {
    result = result.filter(s => s.category.toLowerCase().includes(filters.category!));
  }
  if (filters.installedOnly) {
    result = result.filter(s => manager.isInstalled(s.id));
  }
  return result;
}

function toQuickPickItem(
  skill: SkillEntry,
  isFavorite = false
): vscode.QuickPickItem {
  return {
    label: isFavorite ? `$(star-full) /${skill.id}` : `$(symbol-event) /${skill.id}`,
    description:
      skill.category !== 'uncategorized' ? skill.category : undefined,
    detail: skill.description,
  };
}

async function handleSkillSelection(
  skillId: string,
  manager: SkillsManager,
  recentSkills: RecentSkills
): Promise<void> {
  recentSkills.add(skillId);

  const skill = manager.findById(skillId);
  if (!skill) {
    vscode.window.showWarningMessage(`Skill '${skillId}' not found.`);
    return;
  }

  const skillFiles = await manager.readSkillDirectory(skill);
  const content = skillFiles.get('SKILL.md') ?? await manager.readContent(skill);
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!workspaceRoot) {
    vscode.window.showWarningMessage('Open a workspace folder to install skills project-locally.');
    return;
  }
  if (!content) {
    vscode.window.showWarningMessage(`Skill '${skillId}' has no readable content.`);
    return;
  }

  await installSkillLocally(skill.id, content, skillFiles, workspaceRoot);
  await openSkillInChat(skill.name, skill.id, content);
}

async function installSkillLocally(
  skillId: string,
  content: string,
  skillFiles: Map<string, string>,
  workspaceRoot: string
): Promise<void> {
  const skillInstallDir = path.join(workspaceRoot, '.agent', 'skills', skillId);
  if (fs.existsSync(path.join(skillInstallDir, 'SKILL.md'))) { return; }
  const opts: InstallOptions = {
    skillId,
    skillContent: content,
    skillFiles: skillFiles.size > 1 ? skillFiles : undefined,
    workspaceRoot,
  };
  try {
    await new ProjectLocalInstaller().install(opts);
  } catch {
    // Non-fatal — still proceed to attach context
  }
}

async function openSkillInChat(skillName: string, skillId: string, content: string): Promise<void> {
  const fileRefs = `#file:.agent/skills/${skillId}`;
  try {
    await vscode.commands.executeCommand('workbench.action.chat.open', {
      query: fileRefs,
      isPartialQuery: true,
    });
    vscode.window.showInformationMessage(
      `$(check) '${skillName}' installed — skill files added to chat context`
    );
  } catch {
    await vscode.env.clipboard.writeText(fileRefs || content);
    vscode.window.showInformationMessage(
      `$(clippy) '${skillName}' installed — paste in chat to add as context (Ctrl+V)`
    );
  }
}

export function registerBrowseCommand(
  manager: SkillsManager,
  recentSkills: RecentSkills,
  favoriteSkills: FavoriteSkills
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.browse', async () => {
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showErrorMessage(ERR_NO_SKILLS);
      return;
    }

    const fuzzy = new FuzzySearch(skills);

    function buildItems(query: string): vscode.QuickPickItem[] {
      const filters = parseFilters(query);
      const hasFilters = !!(filters.category || filters.installedOnly);
      const textQuery = filters.query;

      if (!textQuery && !hasFilters) {
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
              ...favEntries.map(s => toQuickPickItem(s, true)),
            ]
            : []),
          ...(recentEntries.length > 0
            ? [
              { label: 'Recently Used', kind: vscode.QuickPickItemKind.Separator },
              ...recentEntries.map(s => toQuickPickItem(s, favoriteSkills.has(s.id))),
            ]
            : []),
          {
            label: 'Filter tips: /installed  #tag',
            kind: vscode.QuickPickItemKind.Separator,
          },
          { label: 'All Skills', kind: vscode.QuickPickItemKind.Separator },
          ...skills.map(s => toQuickPickItem(s, favoriteSkills.has(s.id))),
        ];
      }

      // Apply structured filters first
      let filtered = hasFilters ? applyFilters(skills, filters, manager) : skills;

      if (textQuery && FuzzySearch.isTagQuery(textQuery)) {
        const tag = textQuery.slice(1);
        const results = fuzzy.searchByTag(textQuery)
          .filter(s => filtered.includes(s));
        return [
          {
            label: `$(tag) #${tag} — ${results.length} skill(s)`,
            kind: vscode.QuickPickItemKind.Separator,
          },
          ...results.map(s => toQuickPickItem(s, favoriteSkills.has(s.id))),
        ];
      }

      // Fuzzy text search within filtered set
      if (textQuery) {
        const fuzzyFiltered = new FuzzySearch(filtered);
        const results = fuzzyFiltered.search(textQuery);
        const filterLabel = [
          filters.category ? `cat:${filters.category}` : '',
          filters.installedOnly ? 'installed' : '',
        ].filter(Boolean).join(' + ');

        return [
          ...(filterLabel
            ? [{
              label: `$(filter) ${filterLabel} — ${results.length} result(s)`,
              kind: vscode.QuickPickItemKind.Separator,
            }]
            : []),
          ...results.map(s => toQuickPickItem(s, favoriteSkills.has(s.id))),
        ];
      }

      // Filters only, no text query
      const filterLabel = [
        filters.category ? `cat:${filters.category}` : '',
        filters.installedOnly ? 'installed' : '',
      ].filter(Boolean).join(' + ');

      return [
        {
          label: `$(filter) ${filterLabel} — ${filtered.length} skill(s)`,
          kind: vscode.QuickPickItemKind.Separator,
        },
        ...filtered.map(s => toQuickPickItem(s, favoriteSkills.has(s.id))),
      ];
    }

    const qp = vscode.window.createQuickPick();
    qp.placeholder = 'Search skills to add into your project';
    qp.matchOnDetail = false;
    qp.matchOnDescription = false;
    qp.items = buildItems('');

    // VS Code's QuickPick applies its own label filter on top of qp.items.
    // Persist filter tokens separately and strip them from qp.value so VS Code's
    // built-in filter only sees the plain text query.
    let persistedFilters: { category?: string; installedOnly?: boolean } = {};
    let suppressChange = false;

    qp.onDidChangeValue(value => {
      if (suppressChange) { return; }

      const parsed = parseFilters(value);

      // Absorb any newly typed filter tokens into persisted state
      if (parsed.category !== undefined) { persistedFilters.category = parsed.category; }
      if (parsed.installedOnly) { persistedFilters.installedOnly = true; }

      // Reconstruct full filter expression so buildItems sees everything
      const fullExpression = [
        persistedFilters.category ? `/cat:${persistedFilters.category}` : '',
        persistedFilters.installedOnly ? '/installed' : '',
        parsed.query,
      ].filter(Boolean).join(' ');

      qp.items = buildItems(fullExpression);

      // Strip filter tokens from displayed input so VS Code's native filter
      // only runs against the plain text query.
      const hasNewTokens = /\/cat:|\/installed\b/i.test(value);
      if (hasNewTokens) {
        suppressChange = true;
        qp.value = parsed.query;
        suppressChange = false;
      }
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
        await handleSkillSelection(skillId, manager, recentSkills);
      });

      qp.onDidHide(() => resolve());
    });

    qp.dispose();
  });
}
