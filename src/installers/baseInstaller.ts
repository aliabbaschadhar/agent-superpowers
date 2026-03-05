import * as fs from 'fs';
import * as vscode from 'vscode';
import { InstallOptions, InstallResult } from './types';

export abstract class BaseInstaller {
  abstract label: string;

  /** Return the absolute destination file path for the given skill. */
  abstract targetPath(opts: InstallOptions): string;

  async install(opts: InstallOptions): Promise<InstallResult> {
    let destPath: string;
    try {
      destPath = this.targetPath(opts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, destPath: '', message: msg };
    }

    const config = vscode.workspace.getConfiguration('aiSkills');
    const confirmOverwrite = config.get<boolean>('confirmOverwrite', true);

    try {
      if (fs.existsSync(destPath) && confirmOverwrite) {
        const choice = await vscode.window.showWarningMessage(
          `Skill '${opts.skillId}' is already installed at:\n${destPath}\n\nOverwrite?`,
          { modal: true },
          'Overwrite',
          'Cancel'
        );
        if (choice !== 'Overwrite') {
          return { success: false, destPath, message: 'Cancelled by user.' };
        }
      }

      fs.mkdirSync(require('path').dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, opts.skillContent, 'utf-8');
      return { success: true, destPath, message: `Installed to ${destPath}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, destPath, message: `Failed: ${msg}` };
    }
  }
}
