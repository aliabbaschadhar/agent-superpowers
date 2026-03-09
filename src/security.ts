import * as path from 'path';

/** Maximum allowed response body size for remote fetches (5 MB). */
export const MAX_REMOTE_RESPONSE_BYTES = 5 * 1024 * 1024;

/**
 * Ensures that `relative` resolves strictly inside `base`.
 * Returns the resolved absolute path, or `null` when the resolved path would
 * escape the base directory (path-traversal attempt).
 */
export function safeResolvePath(base: string, relative: string): string | null {
  const resolvedBase = path.resolve(base);
  const resolved = path.resolve(base, relative);
  const rel = path.relative(resolvedBase, resolved);
  // If the relative path starts with '..' the resolved path escapes the base
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }
  return resolved;
}

/**
 * Returns `true` when the URL string uses the `https:` protocol.
 * Used to block plaintext or non-HTTP remote override URLs.
 */
export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns `true` when a skill `path` value from the remote index is safe to
 * use for local file caching.  Valid paths are relative and contain no `..`
 * traversal segments.
 */
export function isValidSkillPath(skillPath: string): boolean {
  if (!skillPath || path.isAbsolute(skillPath)) { return false; }
  return !skillPath.split(/[\\/]/).some(seg => seg === '..');
}
