import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { SkillEntry } from '../skills/types';
import { CategoryItem, FavoritesCategoryItem, RecommendedSectionItem, SkillItem, SummaryItem, SkillTreeNode } from './nodes';
import { CTX_INSTALLED_FILTER } from '../constants';
import { FavoriteSkills } from '../favoriteSkills';

export class SkillsTreeProvider implements vscode.TreeDataProvider<SkillTreeNode> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private filterText = '';
  private showInstalledOnly = false;
  private recommendedSkills: SkillEntry[] = [];
  private detectedTechs: string[] = [];

  constructor(
    private readonly manager: SkillsManager,
    private readonly favoriteSkills: FavoriteSkills
  ) { }

  /** Update recommended skills from workspace scan. Always triggers a tree refresh. */
  setRecommendations(skills: SkillEntry[], techs: string[]): void {
    this.recommendedSkills = skills;
    this.detectedTechs = techs;
    this._onDidChangeTreeData.fire();
  }

  /** Update the active filter and re-render the tree. Pass empty string to clear. */
  setFilter(text: string): void {
    this.filterText = text.toLowerCase().trim();
    this._onDidChangeTreeData.fire();
  }

  /** Toggle the "installed only" filter and update the VS Code context key. */
  toggleInstalledFilter(): void {
    this.showInstalledOnly = !this.showInstalledOnly;
    vscode.commands.executeCommand(
      'setContext',
      CTX_INSTALLED_FILTER,
      this.showInstalledOnly
    );
    this._onDidChangeTreeData.fire();
  }

  /** True when the installed-only filter is currently active. */
  isInstalledFilterActive(): boolean {
    return this.showInstalledOnly;
  }

  refresh(): void {
    this.manager.invalidateInstallCache();
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

    if (el instanceof RecommendedSectionItem) {
      return el.skills.map(s => new SkillItem(s, this.manager.isInstalled(s.id), this.favoriteSkills.has(s.id)));
    }

    if (el instanceof FavoritesCategoryItem) {
      const favIds = this.favoriteSkills.get();
      return favIds
        .map(id => this.manager.findById(id))
        .filter((s): s is SkillEntry => s !== undefined)
        .map(s => new SkillItem(s, this.manager.isInstalled(s.id), true));
    }

    if (el instanceof CategoryItem) {
      const skills = this.manager.getByCategory(el.category);
      let filtered = filter ? skills.filter(s => this.skillMatches(s, filter)) : skills;
      if (this.showInstalledOnly) {
        filtered = filtered.filter(s => this.manager.isInstalled(s.id));
      }
      return filtered.map(s => new SkillItem(s, this.manager.isInstalled(s.id), this.favoriteSkills.has(s.id)));
    }

    return [];
  }

  private buildRootChildren(filter: string): SkillTreeNode[] {
    const categories = this.manager.getCategories();
    const total = this.manager.getAll().length;
    const installedCount = this.manager.countInstalled();

    const isFiltering = filter.length > 0;

    // Recommendations are always visible, regardless of active filters
    const recommendations: SkillTreeNode[] = this.recommendedSkills.length > 0
      ? [new RecommendedSectionItem(this.recommendedSkills, this.detectedTechs)]
      : [];

    if (!isFiltering && !this.showInstalledOnly) {
      const favIds = this.favoriteSkills.get();
      const favSection: SkillTreeNode[] = favIds.length > 0
        ? [new FavoritesCategoryItem(favIds.length)]
        : [];

      return [
        new SummaryItem(total, installedCount),
        ...favSection,
        ...recommendations,
        ...categories.map(
          cat => new CategoryItem(cat, this.manager.getByCategory(cat).length)
        ),
      ];
    }

    // Apply text filter and/or installed-only filter
    const filteredCats = categories
      .filter(cat => {
        const skills = this.manager.getByCategory(cat);
        const textOk = isFiltering ? skills.some(s => this.skillMatches(s, filter)) : true;
        const installOk = this.showInstalledOnly
          ? skills.some(s => this.manager.isInstalled(s.id))
          : true;
        return textOk && installOk;
      })
      .map(cat => {
        let skills = this.manager.getByCategory(cat);
        if (isFiltering) { skills = skills.filter(s => this.skillMatches(s, filter)); }
        if (this.showInstalledOnly) { skills = skills.filter(s => this.manager.isInstalled(s.id)); }
        return new CategoryItem(cat, skills.length, isFiltering);
      });

    return [...recommendations, ...filteredCats];
  }

  /** True when a search filter is currently active. */
  isFiltering(): boolean {
    return this.filterText.length > 0;
  }

  /**
   * Returns the skills currently visible in the tree.
   * If a filter is active only matching skills are returned;
   * otherwise every skill is returned.
   */
  getFilteredSkills(): SkillEntry[] {
    const filter = this.filterText;
    if (!filter) {
      return this.manager.getAll();
    }
    return this.manager.getAll().filter(s => this.skillMatches(s, filter));
  }

  private skillMatches(skill: SkillEntry, filter: string): boolean {
    return (
      skill.id.includes(filter) ||
      skill.description.toLowerCase().includes(filter)
    );
  }
}
