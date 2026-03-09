import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillEntry } from './types';
import { REMOTE_BASE_URL } from '../constants';
import { detectInstalledIds } from './InstallationDetector';

/**
 * Handles all local and remote file I/O for skill content.
 * Separated from SkillsManager to keep the orchestration layer focused.
 */
export class SkillsRepository {
  constructor(
    private readonly assetsPath: string,
    private readonly storagePath: string
  ) {}

  /** Returns the Set of skill IDs installed across all known agent targets. */
  getInstalledIds(skills: SkillEntry[]): Set<string> {
    return detectInstalledIds(skills);
  }

  /** Counts how many skills from the list are installed across all known agent targets. */
  countInstalled(skills: SkillEntry[]): number {
    try {
      return detectInstalledIds(skills).size;
    } catch {
      return 0;
    }
  }

  /** Returns the SKILL.md content for a skill, checking bundle → cache → remote. */
  async readContent(skill: SkillEntry): Promise<string | null> {
    // Absolute-path local skill — read directly, no remote fallback
    if (path.isAbsolute(skill.path)) {
      const localFile = path.join(skill.path, 'SKILL.md');
      return fs.existsSync(localFile) ? fs.readFileSync(localFile, 'utf-8') : null;
    }

    // Bundled asset
    const bundledPath = this.contentPath(skill);
    if (fs.existsSync(bundledPath)) {
      return fs.readFileSync(bundledPath, 'utf-8');
    }

    // Storage cache
    const cachedPath = path.join(this.storagePath, skill.path, 'SKILL.md');
    if (fs.existsSync(cachedPath)) {
      return fs.readFileSync(cachedPath, 'utf-8');
    }

    // Remote fetch with cache write
    try {
      const url = `${REMOTE_BASE_URL}${skill.path}/SKILL.md`;
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      const content = await res.text();
      fs.mkdirSync(path.dirname(cachedPath), { recursive: true });
      fs.writeFileSync(cachedPath, content, 'utf-8');
      return content;
    } catch {
      return null;
    }
  }

  /**
   * Returns all files for a skill as Map<relPath, content>.
   * Falls back to a single-entry map with only SKILL.md when companions are unavailable.
   */
  async readSkillDirectory(skill: SkillEntry): Promise<Map<string, string>> {
    // Local absolute-path skill
    if (path.isAbsolute(skill.path)) {
      const files = this.walkDir(skill.path);
      if (files.size > 0) {
        return files;
      }
      const single = await this.readContent(skill);
      return single ? new Map([['SKILL.md', single]]) : new Map();
    }

    // Bundled assets directory
    const bundledDir = path.join(this.assetsPath, skill.path);
    if (fs.existsSync(path.join(bundledDir, 'SKILL.md'))) {
      return this.walkDir(bundledDir);
    }

    // Storage cache — expand companions if needed
    const cachedDir = path.join(this.storagePath, skill.path);
    if (fs.existsSync(path.join(cachedDir, 'SKILL.md'))) {
      const cached = this.walkDir(cachedDir);
      if (cached.size === 1) {
        await this.fetchCompanionFiles(skill, cached.get('SKILL.md')!, cachedDir);
        return this.walkDir(cachedDir);
      }
      return cached;
    }

    // Remote fetch
    try {
      const mainUrl = `${REMOTE_BASE_URL}${skill.path}/SKILL.md`;
      const res = await fetch(mainUrl);
      if (!res.ok) {
        return new Map();
      }
      const mainContent = await res.text();

      fs.mkdirSync(cachedDir, { recursive: true });
      fs.writeFileSync(path.join(cachedDir, 'SKILL.md'), mainContent, 'utf-8');
      await this.fetchCompanionFiles(skill, mainContent, cachedDir);
      return this.walkDir(cachedDir);
    } catch {
      return new Map();
    }
  }

  /** Returns the absolute path to the bundled or cached SKILL.md for a skill. */
  contentPath(skill: SkillEntry): string {
    if (path.isAbsolute(skill.path)) {
      return path.join(skill.path, 'SKILL.md');
    }
    const bundledPath = path.join(this.assetsPath, skill.path, 'SKILL.md');
    if (fs.existsSync(bundledPath)) {
      return bundledPath;
    }
    return path.join(this.storagePath, skill.path, 'SKILL.md');
  }

  /**
   * Scans the user-configured local skills folder and merges found skills
   * into the provided array. Returns the count of newly added skills.
   */
  loadLocalSources(skills: SkillEntry[]): number {
    const config = vscode.workspace.getConfiguration('aiSkills');
    let localPath = config.get<string>('localSkillsPath', '').trim();
    if (!localPath) {
      return 0;
    }

    if (localPath.startsWith('~')) {
      const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
      localPath = path.join(home, localPath.slice(1));
    }

    if (!fs.existsSync(localPath)) {
      return 0;
    }

    let added = 0;
    try {
      for (const entry of fs.readdirSync(localPath, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }
        const skillFile = path.join(localPath, entry.name, 'SKILL.md');
        if (!fs.existsSync(skillFile)) {
          continue;
        }
        const id = `local-${entry.name}`;
        if (skills.some((s) => s.id === id)) {
          continue;
        }
        skills.push({
          id,
          path: path.join(localPath as string, entry.name),
          category: 'personal',
          name: entry.name,
          description: 'Local skill',
          risk: 'none',
          source: 'personal',
        });
        added++;
      }
    } catch {
      /* ignore read errors, e.g. permission denied */
    }
    return added;
  }

  /** Recursively walks `dir` and returns a Map<relPath, content> for every file. */
  walkDir(dir: string, base = dir): Map<string, string> {
    const result = new Map<string, string>();
    if (!fs.existsSync(dir)) {
      return result;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(base, full).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        for (const [k, v] of this.walkDir(full, base)) {
          result.set(k, v);
        }
      } else {
        try {
          result.set(rel, fs.readFileSync(full, 'utf-8'));
        } catch {
          /* skip unreadable */
        }
      }
    }
    return result;
  }

  /**
   * Parses SKILL.md content for backtick-quoted file references (e.g. `rest.md`,
   * `scripts/api_validator.py`), fetches each from the remote, and writes to cacheDir.
   */
  private async fetchCompanionFiles(
    skill: SkillEntry,
    mainContent: string,
    cacheDir: string
  ): Promise<void> {
    const pattern = /`([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.:-]+)*\.[a-zA-Z0-9]+)`/g;
    const refs = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(mainContent)) !== null) {
      if (m[1] !== 'SKILL.md') {
        refs.add(m[1]);
      }
    }

    await Promise.allSettled(
      [...refs].map(async (ref) => {
        const destFile = path.join(cacheDir, ref);
        if (fs.existsSync(destFile)) {
          return;
        }
        try {
          const url = `${REMOTE_BASE_URL}${skill.path}/${ref}`;
          const res = await fetch(url);
          if (!res.ok) {
            return;
          }
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          fs.writeFileSync(destFile, await res.text(), 'utf-8');
        } catch {
          /* best-effort */
        }
      })
    );
  }
}
