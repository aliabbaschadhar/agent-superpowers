import * as vscode from 'vscode';

const STATE_KEY = 'aiSkills.recentIds';
const MAX_RECENT = 10;

export class RecentSkills {
  constructor(private readonly context: vscode.ExtensionContext) { }

  add(skillId: string): void {
    const current = this.get();
    const updated = [skillId, ...current.filter(id => id !== skillId)].slice(0, MAX_RECENT);
    this.context.globalState.update(STATE_KEY, updated);
  }

  get(): string[] {
    return this.context.globalState.get<string[]>(STATE_KEY, []);
  }

  clear(): void {
    this.context.globalState.update(STATE_KEY, []);
  }
}
