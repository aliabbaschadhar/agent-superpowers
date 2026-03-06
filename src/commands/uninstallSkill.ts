import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager } from '../skillsManager';
import { logError } from '../logger';

interface InstalledLocation {
  label: string;
  detail: string;
  fsPath: string;
  isCopilot?: boolean;
  skillId: string;
}

type UninstallArg = { skill: { id: string } } | string | undefined;

export function registerUninstallCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.uninstall',
    async (arg?: UninstallArg) => {
      // Resolve skill ID from tree item or show QuickPick
      let resolvedId: string | undefined;
      if (typeof arg === 'string') {
        resolvedId = arg;
      } else if (arg && typeof arg === 'object' && 'skill' in arg) {
        resolvedId = arg.skill.id;
      }

      if (!resolvedId) {
        const picked = await vscode.window.showQuickPick(
          manager.getAll().map(s => ({ label: s.id, description: s.description })),
          { placeHolder: 'Select skill to uninstall…' }
        );
        if (!picked) { return; }
        resolvedId = picked.label;
      }

      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const config = vscode.workspace.getConfiguration('aiSkills');
      const claudeBase = config.get<string>('claudeSkillsPath', '').trim()
        || path.join(os.homedir(), '.claude', 'skills');

      const candidates: InstalledLocation[] = [
        {
          label: '$(terminal) Claude Code',
          detail: path.join(claudeBase, resolvedId, 'SKILL.md'),
          fsPath: path.join(claudeBase, resolvedId, 'SKILL.md'),
          skillId: resolvedId,
        },
        {
          label: '$(tools) Cursor (Global)',
          detail: path.join(os.homedir(), '.cursor', 'rules', `${resolvedId}.mdc`),
          fsPath: path.join(os.homedir(), '.cursor', 'rules', `${resolvedId}.mdc`),
          skillId: resolvedId,
        },
        ...(workspaceRoot ? [
          {
            label: '$(tools) Cursor (Project)',
            detail: path.join(workspaceRoot, '.cursor', 'rules', `${resolvedId}.mdc`),
            fsPath: path.join(workspaceRoot, '.cursor', 'rules', `${resolvedId}.mdc`),
            skillId: resolvedId,
          },
          {
            label: '$(github) GitHub Copilot',
            detail: path.join(workspaceRoot, '.github', 'copilot-instructions.md'),
            fsPath: path.join(workspaceRoot, '.github', 'copilot-instructions.md'),
            isCopilot: true,
            skillId: resolvedId,
          },
        ] : []),
      ].filter(loc => {
        if (loc.isCopilot) {
          // Only show Copilot if the file contains the skill marker
          if (!fs.existsSync(loc.fsPath)) { return false; }
          const content = fs.readFileSync(loc.fsPath, 'utf-8');
          return content.includes(`<!-- AI Agent Skill: ${resolvedId} -->`);
        }
        return fs.existsSync(loc.fsPath);
      });

      if (candidates.length === 0) {
        vscode.window.showInformationMessage(
          `AI Skills: '${resolvedId}' is not installed in any known location.`
        );
        return;
      }

      const chosen = await vscode.window.showQuickPick(candidates, {
        placeHolder: `Found ${candidates.length} installation(s) of '${resolvedId}'. Select to remove.`,
        canPickMany: true,
      });

      if (!chosen || chosen.length === 0) { return; }

      let removed = 0;
      for (const loc of chosen) {
        try {
          if (loc.isCopilot) {
            // Strip only the appended block for this skill, keep the rest of the file
            const content = fs.readFileSync(loc.fsPath, 'utf-8');
            const marker = `<!-- AI Agent Skill: ${loc.skillId} -->`;
            const stripped = content
              .replace(new RegExp(`\\n*${escapeRegex(marker)}[\\s\\S]*?(?=\\n<!-- AI Agent Skill:|$)`, 'g'), '')
              .trimEnd();
            fs.writeFileSync(loc.fsPath, stripped + '\n', 'utf-8');
          } else {
            fs.unlinkSync(loc.fsPath);
          }
          removed++;
        } catch (err: unknown) {
          logError(`Uninstall failed for '${loc.skillId}' at ${loc.fsPath}`, err);
        }
      }

      vscode.window.showInformationMessage(
        `AI Skills: Removed '${resolvedId}' from ${removed} location(s).`
      );
    }
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
