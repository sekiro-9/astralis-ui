import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { findInstalledLibrary } from "./spec-resolve.mjs";

const THEME_EXPORTS = ["./serialize", "./contrast", "./styles.css"];

function exportTarget(pkg, subpath) {
  const entry = pkg.exports?.[subpath];
  return typeof entry === "string" ? entry : (entry?.import ?? entry?.default ?? null);
}

/**
 * The theme maths and stylesheet `astralis theme` should use: the project's
 * own astralis-ui when it has one new enough, so the generated file matches
 * the version it will be loaded next to; otherwise the copy bundled with the
 * CLI. `source` is "project" or "bundled"; `outdated` names a project copy
 * that was passed over.
 */
export async function loadThemeLibrary(cwd) {
  let outdated = null;
  const pkgPath = findInstalledLibrary(cwd);
  if (pkgPath) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const root = dirname(pkgPath);
    const [serializeFile, contrastFile, stylesFile] = THEME_EXPORTS.map((subpath) => exportTarget(pkg, subpath));
    if (serializeFile && contrastFile && stylesFile) {
      const [serialize, contrast] = await Promise.all(
        [serializeFile, contrastFile].map((file) => import(pathToFileURL(join(root, file)).href)),
      );
      return { serialize, contrast, stylesPath: join(root, stylesFile), version: pkg.version, source: "project" };
    }
    outdated = pkg.version;
  }

  const [serialize, contrast] = await Promise.all([import("astralis-ui/serialize"), import("astralis-ui/contrast")]);
  const stylesPath = fileURLToPath(import.meta.resolve("astralis-ui/styles.css"));
  const version = JSON.parse(readFileSync(join(dirname(stylesPath), "..", "package.json"), "utf8")).version;
  return { serialize, contrast, stylesPath, version, source: "bundled", outdated };
}
