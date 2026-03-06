import * as fs from 'fs';
import * as vscode from 'vscode';
import { InstallOptions, InstallResult } from './types';
import { logError } from '../logger';

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

      const skillDir = require('path').dirname(destPath);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(destPath, opts.skillContent, 'utf-8');

      // Write companion files (e.g. rest.md, scripts/api_validator.py) when present
      if (opts.skillFiles) {
        for (const [relPath, content] of opts.skillFiles) {
          if (relPath === 'SKILL.md') { continue; }   // already written above
          const companionDest = require('path').join(skillDir, relPath);
          fs.mkdirSync(require('path').dirname(companionDest), { recursive: true });
          fs.writeFileSync(companionDest, content, 'utf-8');
        }
      }

      return { success: true, destPath, message: `Installed to ${destPath}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(`Install failed for '${opts.skillId}'`, err);
      return { success: false, destPath, message: `Failed: ${msg}` };
    }
  }
}
