import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillEntry } from '../skills/types';
import { CategoryItem, SkillItem, SummaryItem, SkillTreeNode } from './nodes';

export class SkillsTreeProvider implements vscode.TreeDataProvider<SkillTreeNode> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private filterText = '';

  constructor(private readonly manager: SkillsManager) { }

  /** Update the active filter and re-render the tree. Pass empty string to clear. */
  setFilter(text: string): void {
    this.filterText = text.toLowerCase().trim();
    this._onDidChangeTreeData.fire();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(el: SkillTreeNode): vscode.TreeItem {
    return el;
  }

  getChildren(el?: SkillTreeNode): SkillTreeNode[] {
    const filter = this.filterText;

    if (!el) {
      return this.buildRootChildren(filter);
    }

    if (el instanceof CategoryItem) {
      const skills = this.manager.getByCategory(el.category);
      const filtered = filter ? skills.filter(s => this.skillMatches(s, filter)) : skills;
      return filtered.map(s => new SkillItem(s));
    }

    return [];
  }

  private buildRootChildren(filter: string): SkillTreeNode[] {
    const categories = this.manager.getCategories();
    const total = this.manager.getAll().length;
    const installed = this.manager.countInstalled();

    if (!filter) {
      return [
        new SummaryItem(total, installed),
        ...categories.map(
          cat => new CategoryItem(cat, this.manager.getByCategory(cat).length)
        ),
      ];
    }

    // Only categories that have at least one matching skill
    return categories
      .filter(cat =>
        this.manager.getByCategory(cat).some(s => this.skillMatches(s, filter))
      )
      .map(cat => {
        const matching = this.manager
          .getByCategory(cat)
          .filter(s => this.skillMatches(s, filter));
        return new CategoryItem(cat, matching.length, true);
      });
  }

  private skillMatches(skill: SkillEntry, filter: string): boolean {
    return (
      skill.id.includes(filter) ||
      skill.description.toLowerCase().includes(filter)
    );
  }
}
