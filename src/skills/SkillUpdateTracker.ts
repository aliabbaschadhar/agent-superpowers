import * as crypto from 'crypto';
import * as vscode from 'vscode';

const STATE_KEY = 'aiSkills.installHashes';

/**
 * Tracks SHA-256 content hashes of installed skills so the extension can
 * detect when an installed skill's bundled/remote content has changed.
 */
export class SkillUpdateTracker {
  constructor(private readonly context: vscode.ExtensionContext) { }

  /** Stores the SHA-256 hash for a skill after successful install. */
  setHash(skillId: string, content: string): void {
    const all = this.getAll();
    all[skillId] = this.hash(content);
    this.context.globalState.update(STATE_KEY, all);
  }

  /** Retrieves the stored hash for a skill, or undefined if never recorded. */
  getHash(skillId: string): string | undefined {
    return this.getAll()[skillId];
  }

  /**
   * Returns true when the skill has a recorded install hash AND the latest
   * content hash differs from it (i.e. an update is available).
   */
  hasUpdate(skillId: string, latestContent: string): boolean {
    const stored = this.getHash(skillId);
    if (!stored) { return false; }
    return stored !== this.hash(latestContent);
  }

  /** Removes the stored hash for a skill (e.g. after uninstall). */
  remove(skillId: string): void {
    const all = this.getAll();
    delete all[skillId];
    this.context.globalState.update(STATE_KEY, all);
  }

  /** Returns the full hash record. */
  getAll(): Record<string, string> {
    return this.context.globalState.get<Record<string, string>>(STATE_KEY, {});
  }

  /** Clears all stored hashes. */
  clear(): void {
    this.context.globalState.update(STATE_KEY, {});
  }

  private hash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  }
}
