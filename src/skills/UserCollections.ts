import * as vscode from 'vscode';

const STATE_KEY = 'aiSkills.userCollections';

export interface UserCollection {
  id: string;
  name: string;
  icon: string;
  skillIds: string[];
  createdAt: string;
}

/**
 * Persists user-defined skill collections across VS Code sessions
 * using globalState (shared across all workspaces).
 */
export class UserCollections {
  constructor(private readonly context: vscode.ExtensionContext) {}

  /** Returns all user collections in creation order. */
  getAll(): UserCollection[] {
    return this.context.globalState.get<UserCollection[]>(STATE_KEY, []);
  }

  /** Returns a single collection by id, or undefined. */
  get(id: string): UserCollection | undefined {
    return this.getAll().find((c) => c.id === id);
  }

  /** Creates a new collection and persists it. Returns the created collection. */
  create(name: string, skillIds: string[], icon = 'list-unordered'): UserCollection {
    const collection: UserCollection = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      icon,
      skillIds: [...new Set(skillIds)],
      createdAt: new Date().toISOString(),
    };
    const current = this.getAll();
    this.context.globalState.update(STATE_KEY, [...current, collection]);
    return collection;
  }

  /** Updates an existing collection. Pass a partial patch (name and/or skillIds). */
  update(id: string, patch: Partial<Pick<UserCollection, 'name' | 'skillIds' | 'icon'>>): void {
    const all = this.getAll().map((c) => {
      if (c.id !== id) {
        return c;
      }
      return {
        ...c,
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
        ...(patch.skillIds !== undefined ? { skillIds: [...new Set(patch.skillIds)] } : {}),
      };
    });
    this.context.globalState.update(STATE_KEY, all);
  }

  /** Deletes a collection by id. */
  delete(id: string): void {
    this.context.globalState.update(
      STATE_KEY,
      this.getAll().filter((c) => c.id !== id)
    );
  }

  /** Adds a skill to a collection (no-op if already present). */
  addSkill(collectionId: string, skillId: string): void {
    const all = this.getAll().map((c) => {
      if (c.id !== collectionId) {
        return c;
      }
      if (c.skillIds.includes(skillId)) {
        return c;
      }
      return { ...c, skillIds: [...c.skillIds, skillId] };
    });
    this.context.globalState.update(STATE_KEY, all);
  }

  /** Removes a skill from a collection (no-op if not present). */
  removeSkill(collectionId: string, skillId: string): void {
    const all = this.getAll().map((c) => {
      if (c.id !== collectionId) {
        return c;
      }
      return { ...c, skillIds: c.skillIds.filter((id) => id !== skillId) };
    });
    this.context.globalState.update(STATE_KEY, all);
  }

  /** Returns true if any user collections exist. */
  hasAny(): boolean {
    return this.getAll().length > 0;
  }
}
