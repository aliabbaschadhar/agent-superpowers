import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from './skillsManager';

export class CategoryItem extends vscode.TreeItem {
  readonly contextValue = 'category';

  constructor(
    public readonly category: string,
    public readonly skillCount: number
  ) {
    super(category, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `${skillCount} skills`;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.tooltip = `${category} (${skillCount} skills)`;
  }
}

export class SkillItem extends vscode.TreeItem {
  readonly contextValue = 'skill';

  constructor(public readonly skill: SkillEntry) {
    super(skill.id, vscode.TreeItemCollapsibleState.None);

    const desc = skill.description;
    this.description =
      desc.length > 60 ? desc.slice(0, 60) + '…' : desc;

    this.tooltip = new vscode.MarkdownString(
      `**${skill.id}**\n\n${desc}\n\n*Risk: ${skill.risk} | Source: ${skill.source}*`
    );

    this.iconPath = new vscode.ThemeIcon(
      skill.risk === 'safe' ? 'verified' : 'circle-outline'
    );

    // Clicking the item previews its content
    this.command = {
      command: 'aiSkills.preview',
      title: 'Preview',
      arguments: [skill.id],
    };
  }
}

export type SkillTreeNode = CategoryItem | SkillItem;

export class SkillsTreeProvider
  implements vscode.TreeDataProvider<SkillTreeNode> {
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly manager: SkillsManager) { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(el: SkillTreeNode): vscode.TreeItem {
    return el;
  }

  getChildren(el?: SkillTreeNode): SkillTreeNode[] {
    if (!el) {
      return this.manager
        .getCategories()
        .map(
          cat =>
            new CategoryItem(cat, this.manager.getByCategory(cat).length)
        );
    }

    if (el instanceof CategoryItem) {
      return this.manager
        .getByCategory(el.category)
        .map(s => new SkillItem(s));
    }

    return [];
  }
}
