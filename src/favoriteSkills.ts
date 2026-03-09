import * as vscode from 'vscode';

const STATE_KEY = 'aiSkills.favoriteIds';

/**
 * Persists a user's starred/favorited skills across VS Code sessions
 * using globalState (shared across all workspaces).
 */
export class FavoriteSkills {
  constructor(private readonly context: vscode.ExtensionContext) {}

  /** Returns all favorited skill IDs in insertion order. */
  get(): string[] {
    return this.context.globalState.get<string[]>(STATE_KEY, []);
  }

  /** Returns true if the given skill ID is currently favorited. */
  has(id: string): boolean {
    return this.get().includes(id);
  }

  /** Adds a skill to favorites (no-op if already present). */
  add(id: string): void {
    const current = this.get();
    if (!current.includes(id)) {
      this.context.globalState.update(STATE_KEY, [...current, id]);
    }
  }

  /** Removes a skill from favorites (no-op if not present). */
  remove(id: string): void {
    this.context.globalState.update(
      STATE_KEY,
      this.get().filter((i) => i !== id)
    );
  }

  /**
   * Toggles the favorite state of a skill.
   * @returns `true` if the skill is now a favorite; `false` if it was removed.
   */
  toggle(id: string): boolean {
    if (this.has(id)) {
      this.remove(id);
      return false;
    } else {
      this.add(id);
      return true;
    }
  }

  /** Clears all favorites. */
  clear(): void {
    this.context.globalState.update(STATE_KEY, []);
  }
}
