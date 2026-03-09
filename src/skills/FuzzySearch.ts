import Fuse from 'fuse.js';
import { SkillEntry } from './types';

/**
 * Wraps Fuse.js to provide fuzzy search and tag-based category filtering
 * over the loaded skill library.
 */
export class FuzzySearch {
  private readonly fuse: Fuse<SkillEntry>;
  private readonly skills: SkillEntry[];

  constructor(skills: SkillEntry[]) {
    this.skills = skills;
    this.fuse = new Fuse(skills, {
      keys: [
        { name: 'id', weight: 0.5 },
        { name: 'description', weight: 0.4 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }

  /**
   * Fuzzy-search skills by arbitrary query text.
   * Returns results ordered by relevance score (best match first).
   * Falls back to returning all skills if the query is too short.
   */
  search(query: string): SkillEntry[] {
    const q = query.trim();
    if (q.length < 2) {
      return this.skills;
    }
    return this.fuse.search(q).map((r) => r.item);
  }

  /**
   * Filter skills by category tag.
   * Accepts a tag string with or without the leading '#'.
   * Returns alphabetically sorted results whose `category` or `id` contains the tag.
   */
  searchByTag(tag: string): SkillEntry[] {
    const t = tag.replace(/^#/, '').toLowerCase().trim();
    if (!t) {
      return this.skills;
    }
    return this.skills
      .filter((s) => s.category.toLowerCase().includes(t) || s.id.toLowerCase().includes(t))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /** Returns `true` when the query is a tag filter (starts with '#'). */
  static isTagQuery(query: string): boolean {
    return query.trimStart().startsWith('#');
  }
}
