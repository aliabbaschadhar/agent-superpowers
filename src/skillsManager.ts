import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

  constructor(context: vscode.ExtensionContext) {
    this.assetsPath = path.join(context.extensionPath, 'assets');
  }

  /** Load bundled index. Returns true if successful. */
  async init(): Promise<boolean> {
    const manifestPath = path.join(this.assetsPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return false;
    }

    const indexPath = path.join(this.assetsPath, 'skills_index.json');
    if (!fs.existsSync(indexPath)) {
      return false;
    }

    try {
      const raw = fs.readFileSync(indexPath, 'utf-8');
      this.skills = JSON.parse(raw) as SkillEntry[];
      return this.skills.length > 0;
    } catch {
      return false;
    }
  }

  getAll(): SkillEntry[] {
    return this.skills;
  }

  /** Returns sorted unique categories; 'uncategorized' always last. */
  getCategories(): string[] {
    const cats = [...new Set(this.skills.map(s => s.category))].sort();
    const idx = cats.indexOf('uncategorized');
    if (idx > -1) {
      cats.push(cats.splice(idx, 1)[0]);
    }
    return cats;
  }

  getByCategory(category: string): SkillEntry[] {
    return this.skills.filter(s => s.category === category);
  }

  findById(id: string): SkillEntry | undefined {
    return this.skills.find(s => s.id === id);
  }

  /** Reads the SKILL.md content from bundled assets. Returns null if missing. */
  readContent(skill: SkillEntry): string | null {
    const filePath = this.contentPath(skill);
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /** Returns the absolute path to the bundled SKILL.md for a given skill. */
  contentPath(skill: SkillEntry): string {
    return path.join(this.assetsPath, skill.path, 'SKILL.md');
  }
}
