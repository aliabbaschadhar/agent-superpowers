import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SkillEntry } from './types';
import { REMOTE_INDEX_URL } from '../constants';

export class RemoteSync {
  constructor(private readonly storagePath: string) { }

  /**
   * Fetches the latest skills index from the remote (or user-configured URL),
   * persists it to globalStorage, and returns the parsed array.
   * Returns null on any network or parse error.
   */
  async fetchIndex(): Promise<SkillEntry[] | null> {
    try {
      const configUrl = vscode.workspace
        .getConfiguration('aiSkills')
        .get<string>('remoteIndexUrl', '')
        .trim();
      const url = configUrl || REMOTE_INDEX_URL;

      const res = await fetch(url);
      if (!res.ok) { return null; }

      const skills = (await res.json()) as SkillEntry[];

      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
      }
      fs.writeFileSync(
        path.join(this.storagePath, 'skills_index.json'),
        JSON.stringify(skills, null, 2)
      );

      return skills;
    } catch {
      return null;
    }
  }
}
