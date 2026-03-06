import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';

/**
 * Shows a multi-select QuickPick of all skills.
 * The selected skill IDs are joined with newlines and copied to the clipboard.
 */
export function registerBulkCopySkillsCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.bulkCopy', async () => {
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showWarningMessage('No skills available.');
      return;
    }

    const items: (vscode.QuickPickItem & { id: string })[] = skills.map(s => ({
      id: s.id,
      label: `$(symbol-event) ${s.id}`,
      description: s.category !== 'uncategorized' ? s.category : undefined,
      detail: s.description,
    }));

    const qp = vscode.window.createQuickPick<(vscode.QuickPickItem & { id: string })>();
    qp.items = items;
    qp.canSelectMany = true;
    qp.placeholder = 'Select skills to copy to clipboard… (Space to toggle, Enter to confirm)';
    qp.title = 'Bulk Copy Skill IDs';
    qp.matchOnDescription = true;
    qp.matchOnDetail = true;

    const picked = await new Promise<readonly (vscode.QuickPickItem & { id: string })[] | undefined>(
      resolve => {
        qp.onDidAccept(() => { resolve(qp.selectedItems); qp.hide(); });
        qp.onDidHide(() => { resolve(undefined); qp.dispose(); });
        qp.show();
      }
    );

    if (!picked || picked.length === 0) { return; }

    const ids = picked.map(p => p.id).join('\n');
    await vscode.env.clipboard.writeText(ids);

    vscode.window.showInformationMessage(
      `Copied ${picked.length} skill ID${picked.length === 1 ? '' : 's'} to clipboard.`
    );
  });
}
