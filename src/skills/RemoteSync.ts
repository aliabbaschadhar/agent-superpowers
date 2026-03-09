import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SkillEntry } from './types';
import { REMOTE_INDEX_URL } from '../constants';
import { isHttpsUrl } from '../security';

const RETRY_DELAYS_MS = [1000, 2000, 4000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RemoteSync {
  constructor(private readonly storagePath: string) {}

  /**
   * Fetches the latest skills index from the remote (or user-configured URL),
   * persists it to globalStorage, and returns the parsed array.
   * Retries up to 3 times (1s / 2s / 4s back-off) on transient network/5xx errors.
   * Returns null on 4xx errors or after all retries are exhausted.
   */
  async fetchIndex(): Promise<SkillEntry[] | null> {
    const configUrl = vscode.workspace
      .getConfiguration('aiSkills')
      .get<string>('remoteIndexUrl', '')
      .trim();

    // Guard: only allow HTTPS URLs to prevent file:// reads or http downgrade attacks
    if (configUrl && !isHttpsUrl(configUrl)) {
      return null;
    }

    const url = configUrl || REMOTE_INDEX_URL;

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          // 4xx — client error, do not retry
          if (res.status >= 400 && res.status < 500) {
            return null;
          }
          // 5xx — server error, retry after delay
          if (attempt < RETRY_DELAYS_MS.length) {
            await sleep(RETRY_DELAYS_MS[attempt]);
            continue;
          }
          return null;
        }

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
        // Network error — retry
        if (attempt < RETRY_DELAYS_MS.length) {
          await sleep(RETRY_DELAYS_MS[attempt]);
        } else {
          return null;
        }
      }
    }

    return null;
  }
}
