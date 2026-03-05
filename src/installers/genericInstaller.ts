import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { InstallOptions, InstallResult } from './types';

export class GenericInstaller {
  label = 'Custom Path';

  async install(opts: InstallOptions): Promise<InstallResult> {
    const destDir = await vscode.window.showInputBox({
      prompt: `Enter the destination directory for skill '${opts.skillId}'`,
      placeHolder: '/path/to/my-agent/skills/',
      validateInput: v =>
        v && v.trim().length > 0 ? null : 'Path cannot be empty',
    });

    if (!destDir) {
      return { success: false, destPath: '', message: 'Cancelled.' };
    }

    const dest = path.join(destDir.trim(), opts.skillId, 'SKILL.md');

    try {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, opts.skillContent, 'utf-8');
      return { success: true, destPath: dest, message: `Installed to ${dest}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, destPath: dest, message: `Failed: ${msg}` };
    }
  }
}
