import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { BaseInstaller } from './baseInstaller';
import { InstallOptions } from './types';

export class ClaudeInstaller extends BaseInstaller {
  label = 'Claude Code';

  targetPath(opts: InstallOptions): string {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const override = config.get<string>('claudeSkillsPath', '').trim();
    const baseDir = override || path.join(os.homedir(), '.claude', 'skills');
    return path.join(baseDir, opts.skillId, 'SKILL.md');
  }
}
