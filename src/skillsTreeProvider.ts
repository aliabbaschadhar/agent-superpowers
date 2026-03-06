import * as vscode from 'vscode';
import { SkillsManager, SkillEntry } from './skillsManager';
import { DESCRIPTION_TRUNCATE_LENGTH } from './constants';

/** Maps category name (lowercase) to a VS Code theme icon id */
const CATEGORY_ICONS: Record<string, string> = {
  // AI / ML
  'ai': 'hubot',
  'ai-ml': 'hubot',
  // Security
  'security': 'shield',
  // Testing / QA
  'testing': 'beaker',
  // Frontend / Web UI
  'frontend': 'browser',
  // Backend / Server
  'backend': 'server',
  // Database
  'database': 'database',
  // Data / Analytics
  'data': 'graph',
  'data-engineering': 'graph',
  // Cloud / DevOps
  'cloud': 'cloud',
  'cloud-devops': 'cloud',
  'devops': 'server-process',
  // Mobile
  'mobile': 'device-mobile',
  // Documentation / Content
  'documentation': 'book',
  'content-documentation': 'book',
  // API
  'api': 'symbol-interface',
  // Game Development
  'game-development': 'game',
  // Meta / Skill tools
  'meta': 'settings-gear',
  'meta-skills': 'settings-gear',
  // Architecture
  'architecture': 'symbol-class',
  // Developer Tools
  'developer-tools': 'tools',
  // Code Quality
  'code-quality': 'symbol-keyword',
  // Python
  'python': 'symbol-misc',
  // JavaScript / TypeScript
  'javascript-typescript': 'symbol-misc',
  // Automation / Integration
  'automation': 'zap',
  // Auth / Identity
  'auth': 'key',
  // Office Productivity
  'office-productivity': 'file-text',
  // Marketing / Growth
  'marketing-growth': 'megaphone',
  // Product Management
  'product-management': 'project',
  // Workflow / Planning
  'workflow-planning': 'checklist',
  // Research
  'research': 'search',
  // Startup / Business
  'startup-business': 'rocket',
  // Fintech / Payments
  'fintech': 'credit-card',
  // Ecommerce
  'ecommerce': 'package',
  // Networking
  'networking': 'radio-tower',
  // Operations
  'operations': 'gear',
  // HR / Team
  'hr-team': 'organization',
  // Design
  'design': 'symbol-color',
  // Creative
  'creative': 'paintcan',
  // Writing
  'writing': 'pencil',
  // Media
  'media': 'play',
  // Blockchain / Web3
  'blockchain-web3': 'link',
  // Embedded Systems
  'embedded-systems': 'circuit-board',
  // .NET
  'dotnet': 'symbol-misc',
  // Go
  'golang': 'symbol-misc',
  // Rust
  'rust': 'symbol-misc',
  // JVM
  'jvm': 'symbol-misc',
  // Programming Languages
  'programming-languages': 'symbol-misc',
  // Desktop
  'desktop': 'window',
  // App Builder
  'app-builder': 'layers',
  // Consulting
  'consulting': 'comment-discussion',
  // Performance
  'performance': 'dashboard',
};

export class SummaryItem extends vscode.TreeItem {
  readonly contextValue = 'summary';

  constructor(total: number, installed: number) {
    super('Skills Summary', vscode.TreeItemCollapsibleState.None);
    const notInstalled = total - installed;
    this.description = `${total} total · ${installed} installed · ${notInstalled} available`;
    this.tooltip = new vscode.MarkdownString(
      '**Skills Overview**\n\n' +
      `- Total: **${total}**\n` +
      `- Installed: **${installed}**\n` +
      `- Not installed: **${notInstalled}**`
    );
    this.iconPath = new vscode.ThemeIcon('library');
  }
}

export class CategoryItem extends vscode.TreeItem {
  readonly contextValue = 'category';

  constructor(
    public readonly category: string,
    public readonly skillCount: number,
    isFiltered = false
  ) {
    super(category, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `${skillCount}`;
    this.tooltip = `${category} (${skillCount} skills)`;

    const iconName = isFiltered
      ? 'filter'
      : (CATEGORY_ICONS[category.toLowerCase()] ?? 'folder');
    this.iconPath = new vscode.ThemeIcon(iconName);
  }
}

export class SkillItem extends vscode.TreeItem {
  readonly contextValue = 'skill';

  constructor(public readonly skill: SkillEntry) {
    super(skill.id, vscode.TreeItemCollapsibleState.None);

    const desc = skill.description;
    this.description =
      desc.length > DESCRIPTION_TRUNCATE_LENGTH ? desc.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + '…' : desc;

    this.tooltip = new vscode.MarkdownString(
      `**${skill.id}**\n\n${desc}\n\n*Risk: ${skill.risk} | Source: ${skill.source}*`
    );

    this.iconPath = skill.risk === 'safe'
      ? new vscode.ThemeIcon('verified', new vscode.ThemeColor('testing.iconPassed'))
      : new vscode.ThemeIcon('circle-outline');

    // Clicking the item previews its content
    this.command = {
      command: 'aiSkills.preview',
      title: 'Preview',
      arguments: [skill.id],
    };
  }
}

export type SkillTreeNode = SummaryItem | CategoryItem | SkillItem;

export class SkillsTreeProvider
  implements vscode.TreeDataProvider<SkillTreeNode> {
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<void>();
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
        .filter(cat => this.manager.getByCategory(cat).some(s => this.skillMatches(s, filter)))
        .map(cat => {
          const matching = this.manager.getByCategory(cat).filter(s => this.skillMatches(s, filter));
          return new CategoryItem(cat, matching.length, true);
        });
    }

    if (el instanceof CategoryItem) {
      const skills = this.manager.getByCategory(el.category);
      const filtered = filter ? skills.filter(s => this.skillMatches(s, filter)) : skills;
      return filtered.map(s => new SkillItem(s));
    }

    return [];
  }

  private skillMatches(skill: SkillEntry, filter: string): boolean {
    return skill.id.includes(filter) || skill.description.toLowerCase().includes(filter);
  }
}
