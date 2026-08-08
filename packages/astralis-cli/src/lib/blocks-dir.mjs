import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Where a block's files get written.
 *
 * `astralis init` writes no config file — the whole point of the precompiled
 * stylesheet is that a project needs no Astralis-shaped setup — so this is
 * convention first, with two escape hatches for people whose layout differs:
 *
 *   1. --dir on the command line, for a one-off
 *   2. "blocksDir" in astralis.json, for a project that always differs
 *   3. otherwise src/components/blocks, or components/blocks without a src/
 *
 * Never the project root: a block is a component, and dropping .tsx files
 * beside package.json would be nobody's idea of where they live.
 */

export const DEFAULT_SUBPATH = join("components", "blocks");

/** `astralis.json`, if the project has one. Malformed is treated as absent. */
export function readConfig(cwd) {
  const path = join(cwd, "astralis.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Resolve the destination directory, relative to cwd.
 * Returns { relative, source } — source names which rule won, for the log line.
 */
export function resolveBlocksDir(cwd, flagDir) {
  if (flagDir) return { relative: flagDir, source: "--dir" };

  const configured = readConfig(cwd)?.blocksDir;
  if (typeof configured === "string" && configured.trim()) {
    return { relative: configured.trim(), source: "astralis.json" };
  }

  const hasSrc = existsSync(join(cwd, "src"));
  return {
    relative: hasSrc ? join("src", DEFAULT_SUBPATH) : DEFAULT_SUBPATH,
    source: "default",
  };
}
