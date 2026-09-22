import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/* Facts about the project the dev server is running: which astralis-ui,
   framework and React it has installed, and which files make up a route. */

/** The nearest node_modules/<name>/package.json above `root`, parsed, or null. */
export function installedPackage(root, name) {
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name, "package.json");
    if (statSync(candidate, { throwIfNoEntry: false })) {
      try {
        return JSON.parse(readFileSync(candidate, "utf8"));
      } catch {
        return null;
      }
    }
    if (dirname(dir) === dir) return null;
  }
}

/** The spec file's SHA-256: two reports with the same hash ran against the same contract. */
export function specHash(specText) {
  return createHash("sha256").update(specText).digest("hex");
}

/** Versions the overlay shows and a report will carry. */
export function projectInfo(root, framework, spec, specText) {
  return {
    library: {
      name: spec.name,
      version: spec.version,
      specVersion: spec.specVersion,
      specSha256: specHash(specText),
    },
    framework: { name: framework, version: installedPackage(root, framework)?.version ?? null },
    react: installedPackage(root, "react")?.version ?? null,
  };
}

/* ---- Next.js routes --------------------------------------------------------
   The files that render a URL: the page that matches it and every layout or
   template above that page. Route groups "(marketing)" and parallel slots
   "@modal" add no URL segment; [id] matches one segment, [...slug] one or
   more, [[...slug]] any number. */

const APP_DIRS = ["app", "src/app"];
const ROUTE_FILE = /^(page|layout|template)\.(tsx|jsx)$/;

function segmentPattern(segment) {
  if (/^\[\[\.\.\..+\]\]$/.test(segment)) return { kind: "optional-rest" };
  if (/^\[\.\.\..+\]$/.test(segment)) return { kind: "rest" };
  if (/^\[.+\]$/.test(segment)) return { kind: "one" };
  return { kind: "static", value: segment };
}

function matches(patterns, parts) {
  if (patterns.length === 0) return parts.length === 0;
  const [head, ...tail] = patterns;
  if (head.kind === "static") return parts[0] === head.value && matches(tail, parts.slice(1));
  if (head.kind === "one") return parts.length > 0 && matches(tail, parts.slice(1));
  const least = head.kind === "rest" ? 1 : 0;
  for (let taken = parts.length; taken >= least; taken--) {
    if (matches(tail, parts.slice(taken))) return true;
  }
  return false;
}

/**
 * The project-relative files (forward slashes) that render `pathname`, from the
 * project's relative file list. Empty when nothing matches or the project has
 * no app directory.
 */
export function routeFiles(files, pathname) {
  const parts = decodeURI(pathname.split(/[?#]/)[0]).split("/").filter(Boolean);
  const appDir = APP_DIRS.find((dir) => files.some((file) => file.startsWith(`${dir}/`)));
  if (!appDir) return [];

  // Like Next.js, a static segment wins over [id], and [id] over a catch-all.
  const cost = (patterns) =>
    patterns.reduce((sum, p) => sum + (p.kind === "static" ? 0 : p.kind === "one" ? 1 : 100), 0);
  const [page] = files
    .filter((file) => file.startsWith(`${appDir}/`) && /\/page\.(tsx|jsx)$/.test(file))
    .map((file) => {
      const segments = file.slice(appDir.length + 1).split("/").slice(0, -1);
      const patterns = segments.filter((s) => !/^\(.+\)$/.test(s) && !s.startsWith("@")).map(segmentPattern);
      return { file, patterns };
    })
    .filter(({ patterns }) => matches(patterns, parts))
    .sort((a, b) => cost(a.patterns) - cost(b.patterns))
    .map(({ file }) => file);
  if (!page) return [];

  const dirs = page.split("/").slice(0, -1);
  const above = new Set();
  for (let depth = appDir.split("/").length; depth <= dirs.length; depth++) above.add(dirs.slice(0, depth).join("/"));
  const shells = files.filter((file) => {
    const name = file.split("/").pop();
    return ROUTE_FILE.test(name) && !name.startsWith("page.") && above.has(file.split("/").slice(0, -1).join("/"));
  });
  return [page, ...shells.sort((a, b) => b.length - a.length)];
}
