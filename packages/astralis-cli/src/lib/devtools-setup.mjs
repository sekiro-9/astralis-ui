import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { addArrayElement, addImports, insertBeforeBodyClose, parses } from "./edits.mjs";
import { ok, info, fail, bold, cyan, dim, posix } from "./ui.mjs";
import { runCommand } from "./run.mjs";

/* The --devtools half of `astralis init`: astralis-devtools as a
   devDependency, and the wiring its framework needs. Next.js gets the overlay
   component in the root layout and the bridge's route handler; Vite gets the
   plugin. Every step is skipped when already done. */

export const PACKAGE = "astralis-devtools";
export const NEXT_IMPORT = 'import { AstralisDevTools } from "astralis-devtools/next";';
export const NEXT_ELEMENT = "<AstralisDevTools />";
export const ROUTE_SOURCE = 'export { GET, POST } from "astralis-devtools/next/route";\n';
/** What init wrote before the bridge took reports. */
const GET_ONLY_ROUTE_SOURCE = 'export { GET } from "astralis-devtools/next/route";\n';
export const VITE_IMPORT = 'import { astralisDevtools } from "astralis-devtools/vite";';
export const VITE_PLUGIN = "astralisDevtools()";

const VITE_CONFIGS = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs", "vite.config.cts", "vite.config.cjs"];

/**
 * The bridge's route file next to the root layout's app directory:
 * app/layout.tsx → app/api/astralis-devtools/[...path]/route.ts (.js for a
 * JavaScript layout).
 */
export function routeFilePath(layoutRelative) {
  const appDir = dirname(layoutRelative);
  const ext = /\.tsx$/.test(layoutRelative) ? "ts" : "js";
  return posix(join(appDir, "api", "astralis-devtools", "[...path]", `route.${ext}`));
}

/** The layout's own edits: the import and the element before </body>. Chains into init's `apply`. */
export function devtoolsLayoutEdits(source) {
  const imported = addImports(source, [NEXT_IMPORT]);
  const placed = insertBeforeBodyClose(imported.source, NEXT_ELEMENT, "<AstralisDevTools");
  return [imported, placed];
}

export function findViteConfig(cwd) {
  return VITE_CONFIGS.find((name) => existsSync(join(cwd, name))) ?? null;
}

/** The Vite config with the import and the plugin added. */
export function devtoolsViteEdits(source) {
  const imported = addImports(source, [VITE_IMPORT]);
  const added = addArrayElement(imported.source, "plugins", VITE_PLUGIN, "astralisDevtools(");
  return [imported, added];
}

function install({ cwd, pkg, pm, dryRun, out }) {
  const had = Boolean(pkg.dependencies?.[PACKAGE] ?? pkg.devDependencies?.[PACKAGE]);
  if (had) {
    out.step(() => ok(`${PACKAGE} already in dependencies`));
  } else if (dryRun) {
    out.changed();
    out.step(() => info(`would run: ${pm} add -D ${PACKAGE}`));
  } else {
    out.changed();
    out.flush();
    info(`installing ${PACKAGE} with ${pm}…`);
    const result = runCommand(pm, ["add", "-D", PACKAGE], { cwd });
    if (result.status !== 0) fail(`${pm} add -D ${PACKAGE} failed — install it manually, then re-run init --devtools.`);
    ok(`${PACKAGE} installed as a devDependency`);
  }
}

function sayHowToOpen(out) {
  out.after(() => {
    console.log(`\n${bold("DevTools:")} start the dev server and click the ${cyan("✦")} button in the corner of the page.`);
    console.log(dim("  Development only: production builds contain none of it."));
  });
}

/**
 * Install the package and write the files outside the entry file (the Next.js
 * route; the Vite config). The Next.js layout edits go through init's own
 * pipeline via devtoolsLayoutEdits. Returns notes that need attention.
 */
export function setUpDevtools({ cwd, pkg, pm, framework, entry, dryRun, out }) {
  const notes = [];
  install({ cwd, pkg, pm, dryRun, out });

  if (framework === "next") {
    if (!entry) {
      notes.push(`add ${NEXT_ELEMENT} to your root layout and the route ${cyan(ROUTE_SOURCE.trim())} yourself`);
      return notes;
    }
    const shown = routeFilePath(entry.relative);
    const path = join(cwd, shown);
    const existing = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (existing !== null && existing.trim() === GET_ONLY_ROUTE_SOURCE.trim()) {
      // Written by an earlier init, before the bridge took reports: add POST.
      out.changed();
      out.step(() => ok(`${dryRun ? "would update" : "updated"} the DevTools route to take reports ${dim(`(${shown})`)}`));
      if (!dryRun) writeFileSync(path, ROUTE_SOURCE);
    } else if (existing !== null && existing.includes("astralis-devtools/next/route")) {
      out.step(() => ok(`DevTools route already present ${dim(`(${shown})`)}`));
      if (!/\bPOST\b/.test(existing)) notes.push(`${shown} does not export POST, so the DevTools cannot send reports; export POST from "astralis-devtools/next/route" too`);
    } else if (existing !== null) {
      notes.push(`${shown} already exists and does something else; add \`${ROUTE_SOURCE.trim()}\` to it yourself`);
    } else {
      out.changed();
      out.step(() => ok(`${dryRun ? "would write" : "wrote"} the DevTools route ${dim(`(${shown})`)}`));
      if (!dryRun) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, ROUTE_SOURCE);
      }
    }
    sayHowToOpen(out);
    return notes;
  }

  const config = findViteConfig(cwd);
  if (!config) {
    notes.push(`no vite.config found — add ${cyan(VITE_PLUGIN)} from "astralis-devtools/vite" to its plugins yourself`);
    return notes;
  }
  const path = join(cwd, config);
  const original = readFileSync(path, "utf8");
  let source = original;
  for (const result of devtoolsViteEdits(source)) {
    if (result.note) {
      notes.push(`${config}: ${result.note} — add ${cyan(VITE_PLUGIN)} to its plugins yourself`);
      return notes;
    }
    source = result.source;
  }
  if (source === original) {
    out.step(() => ok(`DevTools plugin already in ${config}`));
  } else if (!parses(source)) {
    notes.push(`${config}: the edit would leave it unparseable, so nothing was written — add ${cyan(VITE_PLUGIN)} yourself`);
    return notes;
  } else {
    out.changed();
    out.step(() => ok(`${dryRun ? "would add" : "added"} the DevTools plugin ${dim(`(${config})`)}`));
    if (!dryRun) writeFileSync(path, source);
  }
  sayHowToOpen(out);
  return notes;
}
