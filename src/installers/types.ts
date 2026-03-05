export type AgentKind =
  | 'claude'
  | 'cursor-project'
  | 'cursor-global'
  | 'copilot'
  | 'generic';

export interface InstallOptions {
  skillId: string;
  skillContent: string;
  /** First open workspace folder path; may be undefined if no folder is open. */
  workspaceRoot?: string;
}

export interface InstallResult {
  success: boolean;
  destPath: string;
  message: string;
}
