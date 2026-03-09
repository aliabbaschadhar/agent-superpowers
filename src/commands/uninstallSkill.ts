import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';
import { logError } from '../logger';

type UninstallArg = { skill: { id: string } } | string | undefined;

export function registerUninstallCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.uninstall', async (arg?: UninstallArg) => {
    // Resolve skill ID from tree item or show QuickPick
    let resolvedId: string | undefined;
    if (typeof arg === 'string') {
      resolvedId = arg;
    } else if (arg && typeof arg === 'object' && 'skill' in arg) {
      resolvedId = arg.skill.id;
    }

    if (!resolvedId) {
      const picked = await vscode.window.showQuickPick(
        manager.getAll().map((s) => ({ label: s.id, description: s.description })),
        { placeHolder: 'Select skill to uninstall…' }
      );
      if (!picked) {
        return;
      }
      resolvedId = picked.label;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage(
        'AI Skills: No workspace folder is open. Cannot determine skill install location.'
      );
      return;
    }

    const skillDir = path.join(workspaceRoot, '.agent', 'skills', resolvedId);
    const skillFile = path.join(skillDir, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      vscode.window.showInformationMessage(
        `AI Skills: '${resolvedId}' is not installed in this project.`
      );
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Remove skill '${resolvedId}' from .agent/skills/?`,
      { modal: true },
      'Remove',
      'Cancel'
    );
    if (confirm !== 'Remove') {
      return;
    }

    try {
      fs.rmSync(skillDir, { recursive: true, force: true });
      vscode.window.showInformationMessage(
        `AI Skills: Removed '${resolvedId}' from .agent/skills/.`
      );
    } catch (err: unknown) {
      logError(`Uninstall failed for '${resolvedId}' at ${skillDir}`, err);
      vscode.window.showErrorMessage(
        `AI Skills: Failed to remove '${resolvedId}'. See output for details.`
      );
    }
  });
}

/** Bulk-uninstall ALL installed skills from .agent/skills/ in the open workspace. */
export function registerUninstallAllCommand(
  manager: SkillsManager,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.uninstallAll', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('AI Skills: No workspace folder is open.');
      return;
    }

    const installedSkills = manager.getAll().filter((s) => manager.isInstalled(s.id));
    if (installedSkills.length === 0) {
      vscode.window.showInformationMessage(
        'AI Skills: No skills are currently installed in this project.'
      );
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Remove all ${installedSkills.length} installed skill(s) from .agent/skills/?`,
      { modal: true },
      'Remove All',
      'Cancel'
    );
    if (confirm !== 'Remove All') {
      return;
    }

    let removed = 0;
    let failed = 0;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Uninstalling all skills…',
        cancellable: false,
      },
      async () => {
        for (const skill of installedSkills) {
          const skillDir = path.join(workspaceRoot, '.agent', 'skills', skill.id);
          try {
            fs.rmSync(skillDir, { recursive: true, force: true });
            removed++;
          } catch (err: unknown) {
            logError(`Uninstall failed for '${skill.id}' at ${skillDir}`, err);
            failed++;
          }
        }
      }
    );

    treeProvider.refreshAfterInstall();

    const msg =
      failed > 0
        ? `AI Skills: Removed ${removed} skill(s). ${failed} failed — see Output for details.`
        : `AI Skills: Removed all ${removed} installed skill(s) from .agent/skills/.`;
    vscode.window.showInformationMessage(msg);
  });
}
