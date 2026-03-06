import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SkillEntry } from './types';
import { SkillsRepository } from './SkillsRepository';
import { RemoteSync } from './RemoteSync';

export { SkillEntry } from './types';

/**
 * Orchestrates skill discovery, state management, and queries.
 * Delegates all file I/O to SkillsRepository and remote sync to RemoteSync.
 */
export class SkillsManager {
  private skills: SkillEntry[] = [];
  private readonly repository: SkillsRepository;
  private readonly remoteSync: RemoteSync;

  constructor(
    private readonly assetsPath: string,
    private readonly storagePath: string
  ) {
    this.repository = new SkillsRepository(assetsPath, storagePath);
    this.remoteSync = new RemoteSync(storagePath);
  }

  /** Load bundled index, merge cached remote index, and load local sources. */
  async init(): Promise<boolean> {
    const indexPath = path.join(this.assetsPath, 'skills_index.json');
    if (!fs.existsSync(indexPath)) { return false; }

    try {
      this.skills = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as SkillEntry[];

      const cachedPath = path.join(this.storagePath, 'skills_index.json');
      if (fs.existsSync(cachedPath)) {
        const cached = JSON.parse(fs.readFileSync(cachedPath, 'utf-8')) as SkillEntry[];
        this.mergeSkills(cached);
      }

      this.loadLocalSources();
      return this.skills.length > 0;
    } catch {
      return false;
    }
  }

  /** Fetch latest index from remote and merge new skills. Returns count added. */
  async syncRemote(): Promise<number> {
    const remoteSkills = await this.remoteSync.fetchIndex();
    if (!remoteSkills) { return 0; }
    const oldLen = this.skills.length;
    this.mergeSkills(remoteSkills);
    return this.skills.length - oldLen;
  }

  /** Reload user-configured local skill sources. */
  loadLocalSources(): number {
    return this.repository.loadLocalSources(this.skills);
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getAll(): SkillEntry[] { return this.skills; }

  findById(id: string): SkillEntry | undefined {
    return this.skills.find(s => s.id === id);
  }

  getByCategory(category: string): SkillEntry[] {
    return this.skills.filter(s => s.category === category);
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

  countInstalled(): number { return this.repository.countInstalled(this.skills); }

  // ── Content access (delegated) ─────────────────────────────────────────────

  readContent(skill: SkillEntry): Promise<string | null> {
    return this.repository.readContent(skill);
  }

  readSkillDirectory(skill: SkillEntry): Promise<Map<string, string>> {
    return this.repository.readSkillDirectory(skill);
  }

  contentPath(skill: SkillEntry): string {
    return this.repository.contentPath(skill);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private mergeSkills(incoming: SkillEntry[]): void {
    const existingIds = new Set(this.skills.map(s => s.id));
    for (const s of incoming) {
      if (!existingIds.has(s.id)) {
        this.skills.push(s);
        existingIds.add(s.id);
      }
    }
  }
}

/**
 * Factory — creates a SkillsManager from a VS Code extension context.
 * Keeps the context dependency out of SkillsManager itself.
 */
export function createSkillsManager(context: vscode.ExtensionContext): SkillsManager {
  const assetsPath = path.join(context.extensionPath, 'assets');
  const storagePath = context.globalStorageUri.fsPath;
  return new SkillsManager(assetsPath, storagePath);
}
