import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The astralis-ui version the docs are built against. Server-only: it reads
 * the file system.
 *
 * Read off disk rather than resolved through the module graph: astralis-ui
 * does not export its package.json, and a `require.resolve` call is something
 * Turbopack tries to follow at build time and fails on. The workspace-relative
 * path is the same assumption scripts/gen-block-thumbnails.mjs already makes.
 */
export const uiVersion: string = JSON.parse(
  readFileSync(join(process.cwd(), "..", "astralis-ui", "package.json"), "utf8"),
).version;
