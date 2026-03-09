import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SkillEntry } from './types';
import { REMOTE_INDEX_URL } from '../constants';
import { isHttpsUrl, MAX_REMOTE_RESPONSE_BYTES } from '../security';

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

      // Reject non-HTTPS custom URLs to prevent plaintext data interception
      if (configUrl && !isHttpsUrl(configUrl)) {
        return null;
      }

      const url = configUrl || REMOTE_INDEX_URL;

      const res = await fetch(url);
      if (!res.ok) { return null; }

      // Guard against unexpectedly large responses
      const text = await res.text();
      if (text.length > MAX_REMOTE_RESPONSE_BYTES) { return null; }

      const skills = JSON.parse(text) as SkillEntry[];

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
