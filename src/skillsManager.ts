import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { REMOTE_INDEX_URL, REMOTE_BASE_URL } from './constants';

export interface SkillEntry {
  id: string;
  path: string;       // e.g. "skills/3d-web-experience" (relative to ai-skills root)
  category: string;
  name: string;
  description: string;
  risk: 'safe' | 'unknown' | 'none';
  source: string;
}

export class SkillsManager {
  private skills: SkillEntry[] = [];
  private readonly assetsPath: string;
  private readonly storagePath: string;

  constructor(context: vscode.ExtensionContext) {
    this.assetsPath = path.join(context.extensionPath, 'assets');
    this.storagePath = context.globalStorageUri.fsPath;
  }

  /** Load bundled index and sync with remote. Returns true if successful. */
  async init(): Promise<boolean> {
    const indexPath = path.join(this.assetsPath, 'skills_index.json');
    if (!fs.existsSync(indexPath)) {
      return false;
    }

    try {
      // 1. Load bundled baseline
      const raw = fs.readFileSync(indexPath, 'utf-8');
      this.skills = JSON.parse(raw) as SkillEntry[];

      // 2. Load cached remote index if exists
      const cachedPath = path.join(this.storagePath, 'skills_index.json');
      if (fs.existsSync(cachedPath)) {
        const cachedRaw = fs.readFileSync(cachedPath, 'utf-8');
        const cachedSkills = JSON.parse(cachedRaw) as SkillEntry[];
        this.mergeSkills(cachedSkills);
      }

      // 3. Load user-configured local skills
      this.loadLocalSources();

      return this.skills.length > 0;
    } catch {
      return false;
    }
  }

  /** Fetch latest index from GitHub (or configured URL) and update local state. */
  async syncRemote(): Promise<number> {
    try {
      const configUrl = vscode.workspace.getConfiguration('aiSkills')
        .get<string>('remoteIndexUrl', '').trim();
      const url = configUrl || REMOTE_INDEX_URL;
      const res = await fetch(url);
      if (!res.ok) { return 0; }
      const remoteSkills = await res.json() as SkillEntry[];

      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
      }

      const cachedPath = path.join(this.storagePath, 'skills_index.json');
      fs.writeFileSync(cachedPath, JSON.stringify(remoteSkills, null, 2));

      const oldLen = this.skills.length;
      this.mergeSkills(remoteSkills);
      return this.skills.length - oldLen;
    } catch {
      return 0;
    }
  }

  private mergeSkills(incoming: SkillEntry[]): void {
    const existingIds = new Set(this.skills.map(s => s.id));
    for (const s of incoming) {
      if (!existingIds.has(s.id)) {
        this.skills.push(s);
        existingIds.add(s.id);
      }
    }
  }

  getAll(): SkillEntry[] {
    return this.skills;
  }

  /**
   * Returns the number of skills currently installed in the Claude skills
   * directory (or the user-configured override path).
   */
  countInstalled(): number {
    const config = vscode.workspace.getConfiguration('aiSkills');
    const override = config.get<string>('claudeSkillsPath', '').trim();
    const baseDir = override || path.join(os.homedir(), '.claude', 'skills');
    if (!fs.existsSync(baseDir)) { return 0; }
    try {
      return this.skills.filter(s =>
        fs.existsSync(path.join(baseDir, s.id, 'SKILL.md'))
      ).length;
    } catch {
      return 0;
    }
  }

  /** Returns sorted unique categories; 'personal' second-to-last, 'uncategorized' always last. */
  getCategories(): string[] {
    const cats = [...new Set(this.skills.map(s => s.category))].sort();
    for (const last of ['personal', 'uncategorized']) {
      const idx = cats.indexOf(last);
      if (idx > -1) { cats.push(cats.splice(idx, 1)[0]); }
    }
    return cats;
  }

  getByCategory(category: string): SkillEntry[] {
    return this.skills.filter(s => s.category === category);
  }

  findById(id: string): SkillEntry | undefined {
    return this.skills.find(s => s.id === id);
  }

  /** Reads content. Returns null if missing locally and remote fetch fails. */
  async readContent(skill: SkillEntry): Promise<string | null> {
    // 0. Local skill with absolute path — read directly, no remote fallback
    if (path.isAbsolute(skill.path)) {
      const localFile = path.join(skill.path, 'SKILL.md');
      return fs.existsSync(localFile) ? fs.readFileSync(localFile, 'utf-8') : null;
    }

    // 1. Check bundled assets
    const bundledPath = this.contentPath(skill);
    if (fs.existsSync(bundledPath)) {
      return fs.readFileSync(bundledPath, 'utf-8');
    }

    // 2. Check storage cache
    const cachedPath = path.join(this.storagePath, skill.path, 'SKILL.md');
    if (fs.existsSync(cachedPath)) {
      return fs.readFileSync(cachedPath, 'utf-8');
    }

    // 3. Fetch from remote
    try {
      const url = `${REMOTE_BASE_URL}${skill.path}/SKILL.md`;
      const res = await fetch(url);
      if (!res.ok) { return null; }
      const content = await res.text();

      // Cache it
      fs.mkdirSync(path.dirname(cachedPath), { recursive: true });
      fs.writeFileSync(cachedPath, content, 'utf-8');
      return content;
    } catch {
      return null;
    }
  }

  /**
   * Returns all files for a skill as a Map<relPath, content>.
   * Keys are relative to the skill root, e.g. "SKILL.md", "rest.md",
   * "scripts/api_validator.py".  Falls back to a single-entry map
   * containing only SKILL.md when companion files cannot be found.
   */
  async readSkillDirectory(skill: SkillEntry): Promise<Map<string, string>> {
    // 0. Local absolute-path skill — walk the directory directly
    if (path.isAbsolute(skill.path)) {
      const files = this.walkDir(skill.path);
      if (files.size > 0) { return files; }
      // Fallback: try reading just SKILL.md
      const single = await this.readContent(skill);
      return single ? new Map([['SKILL.md', single]]) : new Map();
    }

    // 1. Bundled assets — entire directory present after prebuild
    const bundledDir = path.join(this.assetsPath, skill.path);
    if (fs.existsSync(path.join(bundledDir, 'SKILL.md'))) {
      return this.walkDir(bundledDir);
    }

    // 2. Storage cache — may already have companion files from a prior fetch
    const cachedDir = path.join(this.storagePath, skill.path);
    if (fs.existsSync(path.join(cachedDir, 'SKILL.md'))) {
      const cached = this.walkDir(cachedDir);
      // If we only have SKILL.md cached, attempt to fetch companions remotely
      if (cached.size === 1) {
        await this.fetchCompanionFiles(skill, cached.get('SKILL.md')!, cachedDir);
        return this.walkDir(cachedDir);
      }
      return cached;
    }

    // 3. Remote fetch — get SKILL.md first, then discover and fetch companions
    try {
      const mainUrl = `${REMOTE_BASE_URL}${skill.path}/SKILL.md`;
      const res = await fetch(mainUrl);
      if (!res.ok) { return new Map(); }
      const mainContent = await res.text();

      fs.mkdirSync(cachedDir, { recursive: true });
      fs.writeFileSync(path.join(cachedDir, 'SKILL.md'), mainContent, 'utf-8');

      await this.fetchCompanionFiles(skill, mainContent, cachedDir);
      return this.walkDir(cachedDir);
    } catch {
      return new Map();
    }
  }

  /**
   * Walks `dir` recursively and returns a Map<relPath, content> for every
   * file found.  `relPath` uses forward slashes and is relative to `dir`.
   */
  private walkDir(dir: string, base = dir): Map<string, string> {
    const result = new Map<string, string>();
    if (!fs.existsSync(dir)) { return result; }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel  = path.relative(base, full).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        for (const [k, v] of this.walkDir(full, base)) {
          result.set(k, v);
        }
      } else {
        try { result.set(rel, fs.readFileSync(full, 'utf-8')); } catch { /* skip unreadable */ }
      }
    }
    return result;
  }

  /**
   * Parses `mainContent` (SKILL.md) for backtick-quoted file references such as
   * `rest.md` or `scripts/api_validator.py`, fetches each from the remote,
   * and writes them into `cacheDir` (creating subdirs as needed).
   */
  private async fetchCompanionFiles(
    skill: SkillEntry,
    mainContent: string,
    cacheDir: string
  ): Promise<void> {
    // Match backtick-quoted relative file paths, e.g. `api-style.md` or `scripts/foo.py`
    const pattern = /`([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.:-]+)*\.[a-zA-Z0-9]+)`/g;
    const refs = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(mainContent)) !== null) {
      const ref = m[1];
      if (ref !== 'SKILL.md') { refs.add(ref); }
    }

    await Promise.allSettled([...refs].map(async (ref) => {
      const destFile = path.join(cacheDir, ref);
      if (fs.existsSync(destFile)) { return; }       // already cached
      try {
        const url = `${REMOTE_BASE_URL}${skill.path}/${ref}`;
        const res = await fetch(url);
        if (!res.ok) { return; }
        const content = await res.text();
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.writeFileSync(destFile, content, 'utf-8');
      } catch { /* best-effort */ }
    }));
  }

  /** Returns the absolute path to the bundled or cached SKILL.md. */
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
   * Scans the user-configured local skills folder and merges any found skills.
   * Each subfolder that contains a SKILL.md is treated as one skill.
   */
  loadLocalSources(): number {
    const config = vscode.workspace.getConfiguration('aiSkills');
    let localPath = config.get<string>('localSkillsPath', '').trim();
    if (!localPath) { return 0; }

    // Expand leading ~ to home directory
    if (localPath.startsWith('~')) {
      const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
      localPath = path.join(home, localPath.slice(1));
    }

    if (!fs.existsSync(localPath)) { return 0; }

    let added = 0;
    try {
      const entries = fs.readdirSync(localPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) { continue; }
        const skillFile = path.join(localPath, entry.name, 'SKILL.md');
        if (!fs.existsSync(skillFile)) { continue; }
        const id = `local-${entry.name}`;
        if (this.skills.some(s => s.id === id)) { continue; }
        this.skills.push({
          id,
          path: path.join(localPath, entry.name), // absolute — handled by contentPath/readContent
          category: 'personal',
          name: entry.name,
          description: 'Local skill',
          risk: 'none',
          source: 'personal',
        });
        added++;
      }
    } catch {
      // ignore read errors (e.g. permission denied)
    }
    return added;
  }
}
