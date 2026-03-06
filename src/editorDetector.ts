import * as vscode from 'vscode';

export type EditorKind = 'cursor' | 'vscode' | 'codium' | 'other';
export type AgentName = 'claude' | 'gemini' | 'cursor' | 'copilot' | 'generic';

/** Detect which editor is running based on vscode.env.appName. */
export function detectEditor(): EditorKind {
  const appName = vscode.env.appName.toLowerCase();
  if (appName.includes('cursor')) { return 'cursor'; }
  if (appName.includes('vscodium')) { return 'codium'; }
  if (appName.includes('code')) { return 'vscode'; }
  return 'other';
}

/**
 * Returns the recommended agent based on the running editor.
 * Respects the aiSkills.defaultAgent config override.
 */
export function recommendedAgent(): AgentName {
  const config = vscode.workspace.getConfiguration('aiSkills');
  const setting = config.get<string>('defaultAgent', 'auto');

  if (setting !== 'auto') {
    return setting as AgentName;
  }

  const editor = detectEditor();
  if (editor === 'cursor') { return 'cursor'; }
  // VS Code and Codium both default to Claude Code (globally available)
  return 'claude';
}
