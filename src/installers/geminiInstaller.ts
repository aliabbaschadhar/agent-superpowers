import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { BaseInstaller } from './baseInstaller';
import { InstallOptions } from './types';

export class GeminiInstaller extends BaseInstaller {
  label = 'Gemini CLI';

  targetPath(opts: InstallOptions): string {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const override = config.get<string>('geminiSkillsPath', '').trim();
    const baseDir = override || path.join(os.homedir(), '.gemini', 'skills');
    return path.join(baseDir, opts.skillId, 'SKILL.md');
  }
}
