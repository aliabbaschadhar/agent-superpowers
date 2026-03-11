import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from '../skills/SkillsManager';
import { log } from '../logger';
import { CMD_REFRESH_CATALOG } from '../constants';

const CATALOG_FILENAME = 'skills-catalog.md';
const AGENT_DIR = '.agent';

/**
 * Builds a Markdown catalog string from the provided skills list,
 * grouped by category — optimized for Copilot Chat context attachment.
 */
export function buildSkillsCatalog(skills: SkillEntry[]): string {
  const byCategory = new Map<string, SkillEntry[]>();

  for (const skill of skills) {
    const cat = skill.category || 'uncategorized';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  const sortedCategories = [...byCategory.keys()].sort();

  const lines: string[] = [
    '# AI Agent Skills — Full Catalog',
    '',
    `> Auto-generated. Total: **${skills.length} skills** across **${sortedCategories.length} categories**.`,
    '> When asked "what skill should I use?", browse this file and suggest the most relevant skill IDs.',
    '> Install a skill: `Ctrl+Shift+/` → search for the skill ID → press Enter.',
    '',
  ];

  for (const category of sortedCategories) {
    lines.push(`## ${category}`);
    lines.push('');
    for (const skill of byCategory.get(category)!) {
      const riskNote = skill.risk && skill.risk !== 'none' ? ` _(risk: ${skill.risk})_` : '';
      lines.push(`- **${skill.id}**: ${skill.description}${riskNote}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Writes `.agent/skills-catalog.md` in the first workspace folder.
 * Called both by the manual command and silently after remote sync.
 * Returns true on success.
 */
export async function writeCatalogToWorkspace(manager: SkillsManager): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const agentDir = path.join(workspaceRoot, AGENT_DIR);
  const catalogPath = path.join(agentDir, CATALOG_FILENAME);

  try {
    const skills = manager.getAll();
    if (skills.length === 0) {
      return false;
    }

    fs.mkdirSync(agentDir, { recursive: true });
    const content = buildSkillsCatalog(skills);
    fs.writeFileSync(catalogPath, content, 'utf-8');

    log(`Catalog written: ${catalogPath} (${skills.length} skills)`);
    return true;
  } catch (err) {
    log(`Failed to write skills catalog: ${String(err)}`);
    return false;
  }
}

/**
 * Registers the `aiSkills.refreshCatalog` command.
 * Writes / refreshes `.agent/skills-catalog.md` with the full live skills index.
 */
export function registerRefreshCatalogCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand(CMD_REFRESH_CATALOG, async () => {
    const ok = await writeCatalogToWorkspace(manager);
    if (ok) {
      const skillCount = manager.getAll().length;
      vscode.window.showInformationMessage(
        `AI Skills: Catalog refreshed — ${skillCount} skills written to .agent/skills-catalog.md`
      );
    } else {
      vscode.window.showWarningMessage(
        'AI Skills: Could not write skills catalog. Open a workspace folder first.'
      );
    }
  });
}
