import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { InstallOptions, InstallResult } from './types';

export class CopilotInstaller {
  label = 'GitHub Copilot';

  async install(opts: InstallOptions): Promise<InstallResult> {
    if (!opts.workspaceRoot) {
      return {
        success: false,
        destPath: '',
        message: 'GitHub Copilot install requires an open workspace folder.',
      };
    }

    const dest = path.join(
      opts.workspaceRoot,
      '.github',
      'copilot-instructions.md'
    );

    try {
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      const marker = `<!-- AI Agent Skill: ${opts.skillId} -->`;

      if (fs.existsSync(dest)) {
        const existing = fs.readFileSync(dest, 'utf-8');
        // Idempotent: skip if already contains this skill
        if (existing.includes(marker)) {
          return {
            success: true,
            destPath: dest,
            message: `Skill '${opts.skillId}' is already in copilot-instructions.md`,
          };
        }
        fs.appendFileSync(
          dest,
          `\n\n${marker}\n\n${opts.skillContent}\n\n---\n`,
          'utf-8'
        );
      } else {
        fs.writeFileSync(
          dest,
          `# GitHub Copilot Instructions\n\n${marker}\n\n${opts.skillContent}\n\n---\n`,
          'utf-8'
        );
      }

      return { success: true, destPath: dest, message: `Appended to ${dest}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, destPath: dest, message: `Failed: ${msg}` };
    }
  }
}
