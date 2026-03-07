export type AgentKind =
  | 'claude'
  | 'gemini'
  | 'cursor-project'
  | 'cursor-global'
  | 'copilot'
  | 'generic';

export interface InstallOptions {
  skillId: string;
  /** Content of SKILL.md — used by single-file installers (Copilot, Cursor). */
  skillContent: string;
  /**
   * All files in the skill directory, keyed by their path relative to the skill
   * root (e.g. "SKILL.md", "rest.md", "scripts/api_validator.py").
   * Used by multi-file installers (Claude, Gemini, Generic).
   * Falls back to writing only SKILL.md when absent.
   */
  skillFiles?: Map<string, string>;
  /** First open workspace folder path; may be undefined if no folder is open. */
  workspaceRoot?: string;
}

export interface InstallResult {
  success: boolean;
  destPath: string;
  message: string;
}
