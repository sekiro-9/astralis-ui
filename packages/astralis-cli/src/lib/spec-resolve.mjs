import { statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

/** Walk upward for node_modules/astralis-ui — the CONSUMER's copy, which is
 *  the version their code must conform to. (require.resolve can't be used:
 *  the library's exports map carries no "require" condition, and a tool's
 *  own dependency copy could be a different version than theirs.) */
export function findInstalledSpec(startDir) {
  for (let dir = resolve(startDir); ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", "astralis-ui", "dist", "system-spec.json");
    if (statSync(candidate, { throwIfNoEntry: false })) return candidate;
    if (dirname(dir) === dir) return null;
  }
}
