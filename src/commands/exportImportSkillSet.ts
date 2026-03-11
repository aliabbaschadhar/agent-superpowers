import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { log, logError } from '../logger';
import { bulkInstall } from './installBulk';

/**
 * File format for exported skill sets:
 * ```json
 * {
 *   "name": "My Team Setup",
 *   "exportedAt": "2026-03-08T...",
 *   "skillIds": ["ai-engineer", "api-design-principles", ...]
 * }
 * ```
 */
interface SkillSetFile {
  name: string;
  exportedAt: string;
  skillIds: string[];
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export function registerExportSkillSetCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.exportSkillSet', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('AI Skills: Open a workspace folder first.');
      return;
    }

    const installedIds = [...manager.getInstalledIds()].sort();
    if (installedIds.length === 0) {
      vscode.window.showInformationMessage(
        'AI Skills: No skills are currently installed to export.'
      );
      return;
    }

    const name = await vscode.window.showInputBox({
      prompt: 'Name for this skill set',
      placeHolder: 'e.g. "My Team Setup" or "Frontend Stack"',
      value: 'My Skill Set',
    });
    if (!name) {
      return;
    }

    const payload: SkillSetFile = {
      name,
      exportedAt: new Date().toISOString(),
      skillIds: installedIds,
    };

    const defaultUri = vscode.Uri.file(path.join(workspaceRoot, 'ai-skills-set.json'));

    const saveUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: { 'Skill Set': ['json'] },
      title: 'Export Skill Set',
    });
    if (!saveUri) {
      return;
    }

    try {
      fs.writeFileSync(saveUri.fsPath, JSON.stringify(payload, null, 2), 'utf-8');
      log(`Exported ${installedIds.length} skill IDs to ${saveUri.fsPath}`);
      vscode.window.showInformationMessage(
        `AI Skills: Exported ${installedIds.length} skill(s) to ${path.basename(saveUri.fsPath)}.`
      );
    } catch (err: unknown) {
      logError('Failed to export skill set', err);
      vscode.window.showErrorMessage('AI Skills: Failed to write skill set file.');
    }
  });
}

// ─── Import ─────────────────────────────────────────────────────────────────────

export function registerImportSkillSetCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.importSkillSet', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage(
        'AI Skills: Open a workspace folder first to import skills into.'
      );
      return;
    }

    const fileUris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectMany: false,
      filters: { 'Skill Set': ['json'] },
      title: 'Import Skill Set',
    });
    if (!fileUris || fileUris.length === 0) {
      return;
    }

    let payload: SkillSetFile;
    try {
      const raw = fs.readFileSync(fileUris[0].fsPath, 'utf-8');
      payload = JSON.parse(raw) as SkillSetFile;
    } catch (err: unknown) {
      logError('Failed to read skill set file', err);
      vscode.window.showErrorMessage('AI Skills: Could not read or parse the selected file.');
      return;
    }

    if (!Array.isArray(payload.skillIds) || payload.skillIds.length === 0) {
      vscode.window.showErrorMessage('AI Skills: The selected file contains no skill IDs.');
      return;
    }

    // Determine which are already installed
    const installedIds = manager.getInstalledIds();
    const missingIds = payload.skillIds.filter((id) => !installedIds.has(id));
    const unknownIds = missingIds.filter((id) => !manager.findById(id));
    const toInstall = missingIds.filter((id) => manager.findById(id));

    if (toInstall.length === 0) {
      const alreadyMsg =
        installedIds.size > 0
          ? `All ${payload.skillIds.length} skill(s) from "${payload.name}" are already installed.`
          : `No matching skills found in the index for "${payload.name}".`;
      vscode.window.showInformationMessage(`AI Skills: ${alreadyMsg}`);
      return;
    }

    const confirmMsg =
      unknownIds.length > 0
        ? `Import "${payload.name}"? Will install ${toInstall.length} skill(s). ${unknownIds.length} skill(s) not found in index.`
        : `Import "${payload.name}"? Will install ${toInstall.length} skill(s).`;

    const confirm = await vscode.window.showInformationMessage(
      confirmMsg,
      { modal: true },
      'Install',
      'Cancel'
    );
    if (confirm !== 'Install') {
      return;
    }

    // Bulk install via the shared bulkInstall helper
    const skillEntries = toInstall
      .map((id) => manager.findById(id))
      .filter((s): s is NonNullable<ReturnType<typeof manager.findById>> => s !== undefined);

    await bulkInstall(skillEntries, `"${payload.name}"`, manager);

    const unknownMsg = unknownIds.length > 0 ? ` · ${unknownIds.length} not in index` : '';
    log(`Import skill set "${payload.name}": complete${unknownMsg}`);
    if (unknownIds.length > 0) {
      vscode.window.showInformationMessage(
        `AI Skills: Import complete. ${unknownIds.length} skill ID(s) not found in index.`
      );
    }
  });
}
