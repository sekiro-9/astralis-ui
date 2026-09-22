import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Folders that hold dependencies or build output, never source to validate. */
export const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".astralis"]);

export const SOURCE_FILE = /\.(tsx|jsx)$/;

/**
 * Every .tsx/.jsx file at or under `path`, skipping SKIP_DIRS: the files
 * `astralis validate` checks, and the ones the DevTools bridge watches.
 * Returns null when `path` does not exist.
 */
export function collectSourceFiles(path, into = []) {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (!stats) return null;
  if (stats.isFile()) {
    if (SOURCE_FILE.test(path)) into.push(path);
    return into;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectSourceFiles(join(path, entry.name), into);
    } else if (SOURCE_FILE.test(entry.name)) {
      into.push(join(path, entry.name));
    }
  }
  return into;
}
