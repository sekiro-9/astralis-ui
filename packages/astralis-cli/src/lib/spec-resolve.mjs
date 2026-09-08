import { statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

/**
 * Walk upward for node_modules/astralis-ui/<file>: the CONSUMER's copy, the
 * version their code must conform to, not this tool's own dependency.
 * (require.resolve can't be used: the library's exports carry no "require"
 * condition.) Returns the file's path, or null.
 */
export function findInstalledLibrary(startDir, file = "package.json") {
  for (let dir = resolve(startDir); ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", "astralis-ui", file);
    if (statSync(candidate, { throwIfNoEntry: false })) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

export function findInstalledSpec(startDir) {
  return findInstalledLibrary(startDir, join("dist", "system-spec.json"));
}
