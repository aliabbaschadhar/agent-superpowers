import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { BaseInstaller } from './baseInstaller';
import { InstallOptions } from './types';

export class CursorInstaller extends BaseInstaller {
  label = 'Cursor';
  private readonly useGlobal: boolean;

  constructor(useGlobal = false) {
    super();
    this.useGlobal = useGlobal;
  }

  targetPath(opts: InstallOptions): string {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const scope = this.useGlobal
      ? 'global'
      : config.get<'project' | 'global'>('cursorScope', 'project');

    if (scope === 'global') {
      return path.join(os.homedir(), '.cursor', 'rules', `${opts.skillId}.mdc`);
    }

    if (!opts.workspaceRoot) {
      throw new Error(
        'No workspace folder open. Open a project folder or switch scope to global.'
      );
    }
    return path.join(opts.workspaceRoot, '.cursor', 'rules', `${opts.skillId}.mdc`);
  }
}
