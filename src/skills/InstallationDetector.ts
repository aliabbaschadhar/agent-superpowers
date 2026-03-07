import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillEntry } from './types';

/**
 * Detects which skills are currently installed across every known agent target:
 *   - Claude Code  (~/.claude/skills/{id}/SKILL.md)
 *   - Gemini CLI   (~/.gemini/skills/{id}/SKILL.md)
 *   - Cursor global (~/.cursor/rules/{id}.mdc)
 *   - Cursor project ({workspaceRoot}/.cursor/rules/{id}.mdc)
 *   - GitHub Copilot ({workspaceRoot}/.github/copilot-instructions.md)
 *
 * Results are returned as a `Set<string>` of installed skill IDs so callers
 * can do O(1) membership tests.
 */
export function detectInstalledIds(skills: SkillEntry[]): Set<string> {
  const config = vscode.workspace.getConfiguration('aiSkills');

  const claudeOverride = config.get<string>('claudeSkillsPath', '').trim();
  const claudeBase = claudeOverride || path.join(os.homedir(), '.claude', 'skills');

  const geminiOverride = config.get<string>('geminiSkillsPath', '').trim();
  const geminiBase = geminiOverride || path.join(os.homedir(), '.gemini', 'skills');

  const cursorGlobalBase = path.join(os.homedir(), '.cursor', 'rules');

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const cursorProjectBase = workspaceRoot
    ? path.join(workspaceRoot, '.cursor', 'rules')
    : null;
  const copilotFile = workspaceRoot
    ? path.join(workspaceRoot, '.github', 'copilot-instructions.md')
    : null;

  // Read Copilot file once rather than per-skill
  let copilotContent: string | null = null;
  if (copilotFile && fs.existsSync(copilotFile)) {
    try { copilotContent = fs.readFileSync(copilotFile, 'utf-8'); } catch { /* skip */ }
  }

  const installed = new Set<string>();

  for (const skill of skills) {
    const id = skill.id;

    if (fs.existsSync(path.join(claudeBase, id, 'SKILL.md'))) {
      installed.add(id);
      continue;
    }

    if (fs.existsSync(path.join(geminiBase, id, 'SKILL.md'))) {
      installed.add(id);
      continue;
    }

    if (fs.existsSync(path.join(cursorGlobalBase, `${id}.mdc`))) {
      installed.add(id);
      continue;
    }

    if (cursorProjectBase && fs.existsSync(path.join(cursorProjectBase, `${id}.mdc`))) {
      installed.add(id);
      continue;
    }

    if (copilotContent?.includes(`<!-- AI Agent Skill: ${id} -->`)) {
      installed.add(id);
      continue;
    }
  }

  return installed;
}
