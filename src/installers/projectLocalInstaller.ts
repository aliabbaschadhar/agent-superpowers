import * as path from 'path';
import { BaseInstaller } from './baseInstaller';
import { InstallOptions } from './types';

/**
 * Installs a skill project-locally at `.agent/skills/{skillId}/SKILL.md`.
 * Requires an open workspace folder.
 */
export class ProjectLocalInstaller extends BaseInstaller {
  label = 'Project (.agent/skills/)';

  targetPath(opts: InstallOptions): string {
    if (!opts.workspaceRoot) {
      throw new Error(
        'No workspace folder is open. Open a project folder first, then install skills.'
      );
    }
    return path.join(opts.workspaceRoot, '.agent', 'skills', opts.skillId, 'SKILL.md');
  }
}
