import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillEntry } from '../skills/types';
import { SKILL_COLLECTIONS } from '../skills/collections';
import { bulkInstall } from './installBulk';

/**
 * Registers the `aiSkills.browseCollections` command — lets users pick a
 * curated skill collection and install all its skills at once.
 */
export function registerBrowseCollectionsCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.browseCollections', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    const items: vscode.QuickPickItem[] = SKILL_COLLECTIONS.map((col) => {
      const resolved = col.skillIds
        .map((id) => manager.findById(id))
        .filter((s): s is SkillEntry => s !== undefined);
      const installedCount = resolved.filter((s) => manager.isInstalled(s.id)).length;

      return {
        label: `$(${col.icon}) ${col.name}`,
        description: `${resolved.length} skills${installedCount > 0 ? ` · ${installedCount} installed` : ''}`,
        detail: col.description,
      };
    });

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a skill collection to preview or install…',
      matchOnDetail: true,
    });
    if (!picked) {
      return;
    }

    // Find the matching collection
    const collection = SKILL_COLLECTIONS.find((c) => picked.label.includes(c.name));
    if (!collection) {
      return;
    }

    // Show the skills inside + install option
    const resolved = collection.skillIds
      .map((id) => manager.findById(id))
      .filter((s): s is SkillEntry => s !== undefined);

    const skillItems: vscode.QuickPickItem[] = [
      {
        label: `$(cloud-download) Install All (${resolved.length} skills)`,
        description: 'Install every skill in this collection',
      },
      { label: '', kind: vscode.QuickPickItemKind.Separator },
      ...resolved.map((s) => ({
        label: `$(${manager.isInstalled(s.id) ? 'pass-filled' : 'circle-outline'}) ${s.id}`,
        description: manager.isInstalled(s.id) ? 'installed' : '',
        detail: s.description,
      })),
    ];

    const action = await vscode.window.showQuickPick(skillItems, {
      placeHolder: `${collection.name} — ${resolved.length} skills`,
      matchOnDetail: true,
    });
    if (!action) {
      return;
    }

    if (action.label.includes('Install All')) {
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('AI Skills: Open a workspace folder first.');
        return;
      }

      await bulkInstall(resolved, `"${collection.name}"`, manager);
    } else {
      // Preview a single skill
      const skillId = action.label.replace(/\$\([^)]+\)\s*/, '');
      if (manager.findById(skillId)) {
        vscode.commands.executeCommand('aiSkills.preview', skillId);
      }
    }
  });
}
