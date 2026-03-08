import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillEntry } from './types';

/**
 * Detects which skills are currently installed project-locally at
 * `.agent/skills/{id}/SKILL.md` within the open workspace folder.
 *
 * Results are returned as a `Set<string>` of installed skill IDs so callers
 * can do O(1) membership tests.
 */
export function detectInstalledIds(skills: SkillEntry[]): Set<string> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const installed = new Set<string>();

  if (!workspaceRoot) {
    return installed;
  }

  const agentSkillsBase = path.join(workspaceRoot, '.agent', 'skills');

  for (const skill of skills) {
    if (fs.existsSync(path.join(agentSkillsBase, skill.id, 'SKILL.md'))) {
      installed.add(skill.id);
    }
  }

  return installed;
}
