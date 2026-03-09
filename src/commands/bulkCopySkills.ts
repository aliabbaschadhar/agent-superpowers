import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { ProjectLocalInstaller } from '../installers/projectLocalInstaller';
import { InstallOptions } from '../installers/types';

/**
 * Shows a multi-select QuickPick of all skills.
 * The selected skill IDs are joined with newlines and copied to the clipboard.
 */
export function registerBulkCopySkillsCommand(manager: SkillsManager): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.bulkCopy', async () => {
    const skills = manager.getAll();

    if (skills.length === 0) {
      vscode.window.showWarningMessage('No skills available.');
      return;
    }

    const items: (vscode.QuickPickItem & { id: string })[] = skills.map((s) => ({
      id: s.id,
      label: `$(symbol-event) ${s.id}`,
      description: s.category !== 'uncategorized' ? s.category : undefined,
      detail: s.description,
    }));

    const qp = vscode.window.createQuickPick<vscode.QuickPickItem & { id: string }>();
    qp.items = items;
    qp.canSelectMany = true;
    qp.placeholder = 'Select skills to copy to clipboard… (Space to toggle, Enter to confirm)';
    qp.title = 'Bulk Copy Skill IDs';
    qp.matchOnDescription = true;
    qp.matchOnDetail = true;

    const picked = await new Promise<
      readonly (vscode.QuickPickItem & { id: string })[] | undefined
    >((resolve) => {
      qp.onDidAccept(() => {
        resolve(qp.selectedItems);
        qp.hide();
      });
      qp.onDidHide(() => {
        resolve(undefined);
        qp.dispose();
      });
      qp.show();
    });

    if (!picked || picked.length === 0) {
      return;
    }

    // Install each selected skill project-locally (if workspace is open)
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    let installCount = 0;

    if (workspaceRoot) {
      for (const item of picked) {
        const skill = manager.findById(item.id);
        if (!skill) {
          continue;
        }
        try {
          const skillFiles = await manager.readSkillDirectory(skill);
          const content = skillFiles.get('SKILL.md') ?? (await manager.readContent(skill));
          if (!content) {
            continue;
          }
          const opts: InstallOptions = {
            skillId: item.id,
            skillContent: content,
            skillFiles: skillFiles.size > 1 ? skillFiles : undefined,
            workspaceRoot,
          };
          await new ProjectLocalInstaller().install(opts);
          installCount++;
        } catch {
          // Non-fatal — continue with remaining skills
        }
      }
    } else {
      vscode.window.showWarningMessage(
        'Open a workspace folder to install skills project-locally.'
      );
    }

    // Copy /skill-id lines to clipboard
    const ids = picked.map((p) => `/${p.id}`).join('\n');
    await vscode.env.clipboard.writeText(ids);

    const label =
      installCount > 0
        ? `$(check) ${installCount} skill${installCount === 1 ? '' : 's'} installed to .agent/skills/ and ${picked.length} ID${picked.length === 1 ? '' : 's'} copied to clipboard.`
        : `Copied ${picked.length} skill ID${picked.length === 1 ? '' : 's'} to clipboard.`;
    vscode.window.showInformationMessage(label);
  });
}
