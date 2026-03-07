import * as vscode from 'vscode';
import { SkillEntry } from '../skills/types';
import { DESCRIPTION_TRUNCATE_LENGTH } from '../constants';
import { TECH_DISPLAY_NAMES } from '../skills/techSkillMap';

/** Maps category name (lowercase) to a VS Code theme icon id. */
const CATEGORY_ICONS: Record<string, string> = {
  'ai': 'hubot',
  'ai-ml': 'hubot',
  'security': 'shield',
  'testing': 'beaker',
  'frontend': 'browser',
  'backend': 'server',
  'database': 'database',
  'data': 'graph',
  'data-engineering': 'graph',
  'cloud': 'cloud',
  'cloud-devops': 'cloud',
  'devops': 'server-process',
  'mobile': 'device-mobile',
  'documentation': 'book',
  'content-documentation': 'book',
  'api': 'symbol-interface',
  'game-development': 'game',
  'meta': 'settings-gear',
  'meta-skills': 'settings-gear',
  'architecture': 'symbol-class',
  'developer-tools': 'tools',
  'code-quality': 'symbol-keyword',
  'python': 'symbol-misc',
  'javascript-typescript': 'symbol-misc',
  'automation': 'zap',
  'auth': 'key',
  'office-productivity': 'file-text',
  'marketing-growth': 'megaphone',
  'product-management': 'project',
  'workflow-planning': 'checklist',
  'research': 'search',
  'startup-business': 'rocket',
  'fintech': 'credit-card',
  'ecommerce': 'package',
  'networking': 'radio-tower',
  'operations': 'gear',
  'hr-team': 'organization',
  'design': 'symbol-color',
  'creative': 'paintcan',
  'writing': 'pencil',
  'media': 'play',
  'blockchain-web3': 'link',
  'embedded-systems': 'circuit-board',
  'dotnet': 'symbol-misc',
  'golang': 'symbol-misc',
  'rust': 'symbol-misc',
  'jvm': 'symbol-misc',
  'programming-languages': 'symbol-misc',
  'desktop': 'window',
  'app-builder': 'layers',
  'consulting': 'comment-discussion',
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

export class FavoritesCategoryItem extends vscode.TreeItem {
  readonly contextValue = 'favoritesCategory';

  constructor(public readonly skillCount: number) {
    super('Favorites', vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${skillCount}`;
    this.tooltip = `Your starred skills (${skillCount})`;
    this.iconPath = new vscode.ThemeIcon(
      'star-full',
      new vscode.ThemeColor('charts.yellow')
    );
  }
}

export class SkillItem extends vscode.TreeItem {
  readonly contextValue: string;

  constructor(
    public readonly skill: SkillEntry,
    installed = false,
    isFavorite = false
  ) {
    super(skill.id, vscode.TreeItemCollapsibleState.None);

    if (installed && isFavorite) {
      this.contextValue = 'skill-installed.favorited';
    } else if (installed) {
      this.contextValue = 'skill-installed';
    } else if (isFavorite) {
      this.contextValue = 'skill.favorited';
    } else {
      this.contextValue = 'skill';
    }

    const desc = skill.description;
    this.description =
      desc.length > DESCRIPTION_TRUNCATE_LENGTH
        ? desc.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + '…'
        : desc;

    this.tooltip = new vscode.MarkdownString(
      `**${skill.id}**\n\n${desc}\n\n*Risk: ${skill.risk} | Source: ${skill.source}*` +
      (installed ? '\n\n✅ **Installed**' : '') +
      (isFavorite ? '\n\n⭐ **Favorited**' : '')
    );

    if (installed) {
      this.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
    } else if (isFavorite) {
      this.iconPath = new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.yellow'));
    } else {
      this.iconPath =
        skill.risk === 'safe'
          ? new vscode.ThemeIcon('verified', new vscode.ThemeColor('testing.iconPassed'))
          : new vscode.ThemeIcon('circle-outline');
    }

    this.command = {
      command: 'aiSkills.preview',
      title: 'Preview',
      arguments: [skill.id],
    };
  }
}

const MAX_TECH_DISPLAY = 4;

export class RecommendedSectionItem extends vscode.TreeItem {
  readonly contextValue = 'recommended';

  constructor(
    public readonly skills: SkillEntry[],
    public readonly techs: string[]
  ) {
    super('Recommended for this Project', vscode.TreeItemCollapsibleState.Expanded);

    const displayNames = techs
      .map(t => TECH_DISPLAY_NAMES[t] ?? t)
      .filter((v, i, a) => a.indexOf(v) === i);
    const shown = displayNames.slice(0, MAX_TECH_DISPLAY);
    const extra = displayNames.length - shown.length;
    const techLabel = shown.join(', ') + (extra > 0 ? ` +${extra} more` : '');

    this.description = `${skills.length} skills · ${techLabel}`;
    this.tooltip = new vscode.MarkdownString(
      `**Recommended for this Project**\n\nDetected: ${displayNames.join(', ')}\n\n` +
      skills.map(s => `- \`${s.id}\``).join('\n')
    );
    this.iconPath = new vscode.ThemeIcon(
      'lightbulb',
      new vscode.ThemeColor('editorLightBulb.foregroundColor')
    );
  }
}

export type SkillTreeNode = SummaryItem | CategoryItem | FavoritesCategoryItem | SkillItem | RecommendedSectionItem;
