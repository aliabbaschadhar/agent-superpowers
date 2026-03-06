export interface SkillEntry {
  id: string;
  /** Relative path e.g. "skills/3d-web-experience" or absolute for local sources. */
  path: string;
  category: string;
  name: string;
  description: string;
  risk: 'safe' | 'unknown' | 'none';
  source: string;
}
