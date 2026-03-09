/**
 * Security utilities — input validation and path sanitization.
 *
 * Keep this module free of VS Code API imports so it can be unit-tested
 * without an extension host.
 */
import * as path from 'path';

/**
 * Valid skill ID pattern.
 * Allows letters, digits, hyphens, underscores, and dots — but never path
 * separators or dots that form a `..` traversal segment.
 *
 * Examples of VALID ids : react-patterns, 3d-web-experience, ai_agent, v1.0
 * Examples of INVALID ids: ../evil, /etc/passwd, foo\bar, ..
 */
const SKILL_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

/**
 * Returns true when `id` is a safe skill identifier.
 * Blocks path separators and `..` traversal sequences.
 */
export function isValidSkillId(id: string): boolean {
  if (!id || id.length > 128) {
    return false;
  }
  // No OS path separators
  if (id.includes('/') || id.includes('\\')) {
    return false;
  }
  // No traversal
  if (id === '..' || id.startsWith('../') || id.includes('/../')) {
    return false;
  }
  return SKILL_ID_RE.test(id);
}

/**
 * Returns true when `childPath` is safely contained within `parentDir`.
 * Prevents path traversal attacks from untrusted relative path inputs.
 *
 * Uses `path.resolve` so symlinks are NOT automatically resolved — this is
 * intentional: we guard against lexical traversals, not symlink attacks,
 * which require OS-level mitigations.
 */
export function isPathWithin(parentDir: string, childPath: string): boolean {
  const resolvedParent = path.resolve(parentDir) + path.sep;
  const resolvedChild = path.resolve(childPath);
  return resolvedChild === path.resolve(parentDir) || resolvedChild.startsWith(resolvedParent);
}

/**
 * Returns true when `raw` is a valid HTTPS URL.
 * Rejects `file://`, `http://`, and other schemes to prevent local-file
 * reads or downgrade attacks via the user-configurable remoteIndexUrl.
 */
export function isHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns true when `relPath` is a safe relative path that stays within its
 * parent directory — i.e., does NOT start with `/`, does NOT use `..`.
 *
 * This is used to validate companion file entries supplied by remote skill
 * manifests before writing them to the local filesystem.
 */
export function isSafeRelativePath(relPath: string): boolean {
  if (!relPath) {
    return false;
  }
  // Must not be absolute
  if (path.isAbsolute(relPath)) {
    return false;
  }
  // Normalize to collapse `.` and detect lingering `..`
  const normalized = path.normalize(relPath);
  return !normalized.startsWith('..') && !normalized.includes(`..${path.sep}`);
}
