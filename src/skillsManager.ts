import * as vscode from 'vscode';
import * as fs from 'fs';
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
