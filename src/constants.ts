/** Remote Syncing */
export const REMOTE_INDEX_URL = 'https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills_index.json';

// Trailing slash so `${REMOTE_BASE_URL}${skill.path}/SKILL.md` concatenates correctly.
// skill.path from the antigravity index is relative, e.g. "skills/bug-hunter"
export const REMOTE_BASE_URL = 'https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/';

/** UI / display */
export const DESCRIPTION_TRUNCATE_LENGTH = 60;

/** Timing */
export const AUTO_PASTE_DELAY_MS = 80;

/** Extension prefix used in all user-facing messages */
export const EXT_PREFIX = 'AI Skills';

/** Command identifiers */
export const CMD_BROWSE = 'aiSkills.browse';
export const CMD_INSTALL = 'aiSkills.install';
export const CMD_INSTALL_FROM_TREE = 'aiSkills.installFromTree';
export const CMD_PREVIEW = 'aiSkills.preview';
export const CMD_COPY_ID = 'aiSkills.copyId';
export const CMD_REFRESH_TREE = 'aiSkills.refreshTree';
export const CMD_FILTER_TREE = 'aiSkills.filterTree';
export const CMD_UNINSTALL = 'aiSkills.uninstall';

/** User-facing error messages */
export const ERR_BUNDLE_INCOMPLETE =
  'AI Agent Skills: Asset bundle is incomplete or missing. Try reinstalling the extension.';

export const ERR_NO_SKILLS =
  `${EXT_PREFIX}: No skills loaded. The extension bundle may be corrupted.`;

export const ERR_SKILL_NOT_FOUND = (id: string): string =>
  `${EXT_PREFIX}: Skill '${id}' not found in index.`;

export const ERR_CONTENT_MISSING = (id: string): string =>
  `${EXT_PREFIX}: Content for skill '${id}' is missing from bundle.`;

export const ERR_OPEN_FILE = (id: string): string =>
  `${EXT_PREFIX}: Could not open SKILL.md for '${id}'.`;
