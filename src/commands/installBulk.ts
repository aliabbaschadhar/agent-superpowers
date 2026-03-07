import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import { SkillsManager } from '../skills/SkillsManager';
import { SkillEntry } from '../skills/types';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';
import { CategoryItem } from '../tree/nodes';
import { InstallOptions, InstallResult } from '../installers/types';
import { CopilotInstaller } from '../installers/copilotInstaller';
import { pickAgent, AgentOption } from './agentPicker';

// ─── Path helpers ──────────────────────────────────────────────────────────────

/**
 * Compute the expected on-disk target path for a skill, given an agent.
 * Returns null for Copilot (single-file append, different detection logic)
 * and when required context (workspaceRoot / genericBase) is missing.
 */
function computeTargetPath(
  agentId: string,
  skillId: string,
  workspaceRoot?: string,
  genericBase?: string
): string | null {
  const cfg = vscode.workspace.getConfiguration('aiSkills');
  const home = os.homedir();

  switch (agentId) {
    case 'claude': {
      const override = cfg.get<string>('claudeSkillsPath', '').trim();
      const base = override || path.join(home, '.claude', 'skills');
      return path.join(base, skillId, 'SKILL.md');
    }
    case 'gemini': {
      const override = cfg.get<string>('geminiSkillsPath', '').trim();
      const base = override || path.join(home, '.gemini', 'skills');
      return path.join(base, skillId, 'SKILL.md');
    }
    case 'cursor-global':
      return path.join(home, '.cursor', 'rules', skillId + '.mdc');
    case 'cursor-project':
      return workspaceRoot
        ? path.join(workspaceRoot, '.cursor', 'rules', skillId + '.mdc')
        : null;
    case 'generic':
      return genericBase ? path.join(genericBase, skillId, 'SKILL.md') : null;
    default:
      return null;
  }
}

/**
 * Write a skill file (and any companions) directly — no modal prompts.
 * Decisions about skip/overwrite are made at the batch level before this call.
 */
function writeDirectly(destPath: string, opts: InstallOptions): InstallResult {
  try {
    const skillDir = path.dirname(destPath);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(destPath, opts.skillContent, 'utf-8');

    if (opts.skillFiles) {
      for (const [relPath, content] of opts.skillFiles) {
        if (relPath === 'SKILL.md') { continue; }
        const companionDest = path.join(skillDir, relPath);
        fs.mkdirSync(path.dirname(companionDest), { recursive: true });
        fs.writeFileSync(companionDest, content, 'utf-8');
      }
    }

    return { success: true, destPath, message: `Installed to ${destPath}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, destPath, message: `Failed: ${msg}` };
  }
}

// ─── Core bulk install logic ───────────────────────────────────────────────────

async function bulkInstall(
  skills: SkillEntry[],
  label: string,
  manager: SkillsManager
): Promise<void> {
  if (skills.length === 0) {
    vscode.window.showInformationMessage('AI Skills: No skills to install.');
    return;
  }

  const agentChoice: AgentOption | undefined = await pickAgent(
    `Install ${skills.length} skill${skills.length > 1 ? 's' : ''} to which agent?`
  );
  if (!agentChoice) { return; }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  // ── Copilot large-batch warning ────────────────────────────────────────────
  if (agentChoice.id === 'copilot' && skills.length > 20) {
    const proceed = await vscode.window.showWarningMessage(
      `Installing ${skills.length} skills to GitHub Copilot will append all content ` +
      'into a single file (.github/copilot-instructions.md), which may become very large. Continue?',
      { modal: true },
      'Continue',
      'Cancel'
    );
    if (proceed !== 'Continue') { return; }
  }

  // ── Generic: prompt for base directory once ────────────────────────────────
  let genericBase: string | undefined;
  if (agentChoice.id === 'generic') {
    const entered = await vscode.window.showInputBox({
      prompt: `Enter the base directory for all ${skills.length} skills`,
      placeHolder: '/path/to/my-agent/skills/',
      validateInput: v => (v && v.trim().length > 0 ? null : 'Path cannot be empty'),
    });
    if (!entered) { return; }
    genericBase = entered.trim();
  }

  // ── Conflict detection for non-Copilot agents ──────────────────────────────
  //
  // Instead of showing a modal for every existing skill, we resolve the
  // skip-vs-overwrite decision once for the whole batch.
  //
  // overwriteExisting:
  //   true  → overwrite all (silently)
  //   false → skip existing skills
  //   null  → no conflicts found, proceed normally
  let overwriteExisting: boolean | null = null;

  if (agentChoice.id !== 'copilot') {
    const cfg = vscode.workspace.getConfiguration('aiSkills');
    const confirmOverwrite = cfg.get<boolean>('confirmOverwrite', true);

    if (confirmOverwrite) {
      const conflicting = skills.filter(s => {
        const p = computeTargetPath(agentChoice.id, s.id, workspaceRoot, genericBase);
        return p ? fs.existsSync(p) : false;
      });

      if (conflicting.length > 0) {
        const choice = await vscode.window.showWarningMessage(
          `${conflicting.length} of ${skills.length} skills are already installed. ` +
          'What would you like to do?',
          { modal: true },
          'Skip Existing',
          'Overwrite All',
          'Cancel'
        );
        if (!choice || choice === 'Cancel') { return; }
        overwriteExisting = choice === 'Overwrite All';
      }
    } else {
      // confirmOverwrite is false → overwrite everything silently
      overwriteExisting = true;
    }
  }

  // ── Install loop ───────────────────────────────────────────────────────────
  let installed = 0;
  let skipped = 0;
  let failed = 0;
  let cancelled = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Installing ${label}…`,
      cancellable: true,
    },
    async (progress, token) => {
      const total = skills.length;

      for (let i = 0; i < total; i++) {
        if (token.isCancellationRequested) {
          cancelled = true;
          break;
        }

        const skill = skills[i];
        progress.report({
          message: `(${i + 1}/${total}) ${skill.id}`,
          increment: (1 / total) * 100,
        });

        try {
          // Copilot: delegate entirely to CopilotInstaller (append + sentinel logic)
          if (agentChoice.id === 'copilot') {
            const skillFiles = await manager.readSkillDirectory(skill);
            const content = skillFiles.get('SKILL.md') ?? await manager.readContent(skill);
            if (!content) { failed++; continue; }

            const opts: InstallOptions = {
              skillId: skill.id,
              skillContent: content,
              skillFiles: skillFiles.size > 1 ? skillFiles : undefined,
              workspaceRoot,
            };
            const result = await new CopilotInstaller().install(opts);
            result.success ? installed++ : failed++;
            continue;
          }

          // All other agents: compute path and write directly
          const destPath = computeTargetPath(agentChoice.id, skill.id, workspaceRoot, genericBase);
          if (!destPath) { failed++; continue; }

          // Skip if already installed and user chose "Skip Existing"
          if (overwriteExisting === false && fs.existsSync(destPath)) {
            skipped++;
            continue;
          }

          const skillFiles = await manager.readSkillDirectory(skill);
          const content = skillFiles.get('SKILL.md') ?? await manager.readContent(skill);
          if (!content) { failed++; continue; }

          const opts: InstallOptions = {
            skillId: skill.id,
            skillContent: content,
            skillFiles: skillFiles.size > 1 ? skillFiles : undefined,
            workspaceRoot,
          };

          const result = writeDirectly(destPath, opts);
          result.success ? installed++ : failed++;
        } catch {
          failed++;
        }
      }
    }
  );

  const parts = [`${installed} installed`];
  if (skipped > 0) { parts.push(`${skipped} skipped`); }
  if (failed > 0) { parts.push(`${failed} failed`); }
  if (cancelled) { parts.push('cancelled'); }

  vscode.window.showInformationMessage(
    `AI Skills bulk install complete: ${parts.join(' · ')}.`
  );
}

// ─── Command registrations ─────────────────────────────────────────────────────

/** Right-click a category node → "Install All in Category" */
export function registerInstallCategoryCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.installCategory',
    async (item?: CategoryItem) => {
      if (!item?.category) {
        vscode.window.showErrorMessage('AI Skills: No category selected.');
        return;
      }
      const skills = manager.getByCategory(item.category);
      await bulkInstall(
        skills,
        `"${item.category}" (${skills.length} skills)`,
        manager
      );
    }
  );
}

/** Toolbar button / summary node → "Install All Skills" (respects active filter) */
export function registerInstallAllCommand(
  manager: SkillsManager,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.installAll',
    async () => {
      const skills = treeProvider.getFilteredSkills();
      const label = treeProvider.isFiltering()
        ? `filtered results (${skills.length} skills)`
        : `all skills (${skills.length})`;
      await bulkInstall(skills, label, manager);
    }
  );
}
