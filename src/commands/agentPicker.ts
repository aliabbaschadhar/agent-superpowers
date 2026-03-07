import * as vscode from 'vscode';
import { recommendedAgent } from '../editorDetector';
import { ClaudeInstaller } from '../installers/claudeInstaller';
import { GeminiInstaller } from '../installers/geminiInstaller';
import { CursorInstaller } from '../installers/cursorInstaller';
import { CopilotInstaller } from '../installers/copilotInstaller';
import { GenericInstaller } from '../installers/genericInstaller';

export interface AgentOption extends vscode.QuickPickItem {
  id: string;
}

export function buildAgentOptions(): AgentOption[] {
  const recommended = recommendedAgent();
  return [
    {
      label: '$(terminal) Claude Code',
      description: '~/.claude/skills/{id}/SKILL.md',
      detail: recommended === 'claude' ? '★ Recommended for your editor' : undefined,
      id: 'claude',
    },
    {
      label: '$(sparkle) Gemini CLI',
      description: '~/.gemini/skills/{id}/SKILL.md',
      detail: recommended === 'gemini' ? '★ Recommended for your editor' : undefined,
      id: 'gemini',
    },
    {
      label: '$(tools) Cursor (Project)',
      description: '.cursor/rules/{id}.mdc',
      detail: recommended === 'cursor' ? '★ Recommended for your editor' : undefined,
      id: 'cursor-project',
    },
    {
      label: '$(tools) Cursor (Global)',
      description: '~/.cursor/rules/{id}.mdc',
      id: 'cursor-global',
    },
    {
      label: '$(github) GitHub Copilot',
      description: '.github/copilot-instructions.md (append)',
      detail: recommended === 'copilot' ? '★ Recommended for your editor' : undefined,
      id: 'copilot',
    },
    {
      label: '$(folder-opened) Custom Path',
      description: 'You choose the directory',
      id: 'generic',
    },
  ];
}

export async function pickAgent(placeHolder: string): Promise<AgentOption | undefined> {
  return vscode.window.showQuickPick(buildAgentOptions(), { placeHolder }) as Promise<AgentOption | undefined>;
}

export type AnyInstaller =
  | ClaudeInstaller
  | GeminiInstaller
  | CursorInstaller
  | CopilotInstaller
  | GenericInstaller;

/** Create the installer for the given agent id. Returns undefined for unknown ids. */
export function createInstaller(agentId: string): AnyInstaller | undefined {
  switch (agentId) {
    case 'claude': return new ClaudeInstaller();
    case 'gemini': return new GeminiInstaller();
    case 'cursor-project': return new CursorInstaller(false);
    case 'cursor-global': return new CursorInstaller(true);
    case 'copilot': return new CopilotInstaller();
    case 'generic': return new GenericInstaller();
    default: return undefined;
  }
}
