import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { SkillsManager } from '../skills/SkillsManager';
import { SkillEntry } from '../skills/types';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';
import { CategoryItem, CollectionItem, UserCollectionItem, RecommendedSectionItem } from '../tree/nodes';
import { InstallOptions, InstallResult } from '../installers/types';
import { SkillUpdateTracker } from '../skills/SkillUpdateTracker';

// ─── Path helper ──────────────────────────────────────────────────────────────

function computeTargetPath(skillId: string, workspaceRoot: string): string {
  return path.join(workspaceRoot, '.agent', 'skills', skillId, 'SKILL.md');
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

export async function bulkInstall(
  skills: SkillEntry[],
  label: string,
  manager: SkillsManager,
  tracker?: SkillUpdateTracker
): Promise<void> {
  if (skills.length === 0) {
    vscode.window.showInformationMessage('AI Skills: No skills to install.');
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage(
      'AI Skills: No workspace folder is open. Open a project folder first, then install skills.'
    );
    return;
  }

  // ── Conflict detection ─────────────────────────────────────────────────────
  //
  // Resolve skip-vs-overwrite once for the whole batch instead of per-skill.
  //
  // overwriteExisting:
  //   true  → overwrite all (silently)
  //   false → skip existing skills
  //   null  → no conflicts found, proceed normally
  let overwriteExisting: boolean | null = null;

  const cfg = vscode.workspace.getConfiguration('aiSkills');
  const confirmOverwrite = cfg.get<boolean>('confirmOverwrite', true);

  if (confirmOverwrite) {
    const conflicting = skills.filter(s =>
      fs.existsSync(computeTargetPath(s.id, workspaceRoot))
    );

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
    overwriteExisting = true;
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
          const destPath = computeTargetPath(skill.id, workspaceRoot);

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
          if (result.success) {
            installed++;
            if (tracker) { tracker.setHash(skill.id, content); }
          } else {
            failed++;
          }
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
/** Right-click a collection node → "Install Collection" */
export function registerInstallCollectionCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.installCollection',
    async (item?: CollectionItem | UserCollectionItem | RecommendedSectionItem) => {
      // Handle RecommendedSectionItem
      if (item instanceof RecommendedSectionItem) {
        if (item.skills.length === 0) {
          vscode.window.showErrorMessage('AI Skills: No recommended skills available.');
          return;
        }
        await bulkInstall(
          item.skills,
          `recommended skills (${item.skills.length} skills)`,
          manager
        );
        return;
      }

      // Handle CollectionItem and UserCollectionItem
      if (!item || !(item instanceof CollectionItem || item instanceof UserCollectionItem)) {
        vscode.window.showErrorMessage('AI Skills: No collection selected.');
        return;
      }

      const collection = item.collection;
      const skillIds = collection.skillIds;
      const skills = skillIds
        .map(id => manager.findById(id))
        .filter((s): s is SkillEntry => s !== undefined);

      if (skills.length === 0) {
        vscode.window.showErrorMessage('AI Skills: No valid skills found in this collection.');
        return;
      }

      await bulkInstall(
        skills,
        `"${collection.name}" collection (${skills.length} skills)`,
        manager
      );
    }
  );
}