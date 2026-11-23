import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { addArrayElement, addImports, insertBeforeBodyClose, parses } from "./edits.mjs";
import { ok, warn, info, bold, cyan, dim, posix } from "./ui.mjs";
import { runCommand } from "./run.mjs";
import { DOCS, commandProblem, createGuide, tryRead, tryWrite } from "./manual.mjs";

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

function install({ cwd, pkg, pm, dryRun, out }, guide) {
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
    if (result.status === 0) {
      ok(`${PACKAGE} installed as a devDependency`);
    } else {
      warn(`${pm} add -D ${PACKAGE} failed; carrying on with the rest`);
      guide.because(`${PACKAGE} wasn't installed: ${commandProblem(result)}`, { failed: true });
      guide.step("Install it from your project's root:", `${pm} add -D ${PACKAGE}`);
    }
  }
}

function sayHowToOpen(out) {
  out.after(() => {
    console.log(`\n${bold("DevTools:")} start the dev server and click the Astralis button at the bottom of the page, or press ${cyan("Shift+Alt+A")}.`);
    console.log(dim("  Development only: production builds contain none of it."));
  });
}

const CHECK_OPEN = "start the dev server and open the app: the Astralis button is at the bottom of the page.";

const layoutStep = (guide, { file, kind }) =>
  guide.step(
    `Open ${file}${kind === "next" ? " (or the file that holds your <body>)" : ""}, import the DevTools and put them ${kind === "nextPages" ? "after <Component />, inside the provider" : "last inside <body>"}:`,
    `${NEXT_IMPORT}\n\n${NEXT_ELEMENT}`,
  );

const pluginStep = (guide, file) =>
  guide.step(`Open ${file}, import the plugin and add it to plugins, keeping the ones already there:`, `${VITE_IMPORT}\n\nplugins: [react(), ${VITE_PLUGIN}],`);

const viteConfigSource = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
${VITE_IMPORT}

export default defineConfig({
  plugins: [react(), ${VITE_PLUGIN}],
});`;

/** The bridge's route handler: written, brought up to date, or left to the guide. */
function setUpRoute({ cwd, shown, dryRun, out, guide }) {
  const path = join(cwd, shown);
  const read = existsSync(path) ? tryRead(path) : { text: null };
  const existing = read.text ?? null;
  const byHand = (why, failed) => {
    guide.because(`${shown} ${why}`, { failed });
    guide.step(`Create ${shown} with:`, ROUTE_SOURCE);
  };
  if (read.problem) return byHand(`couldn't be read: ${read.problem}`, true);

  const isOurs = existing !== null && existing.trim() === GET_ONLY_ROUTE_SOURCE.trim();
  if (existing !== null && !isOurs) {
    if (!existing.includes("astralis-devtools/next/route")) {
      guide.because(`${shown} already exists and does something else, so it was left alone`);
      guide.step(`Open ${shown}, move what it does to another route, and have it hold only:`, ROUTE_SOURCE);
    } else {
      out.step(() => ok(`DevTools route already present ${dim(`(${shown})`)}`));
      if (!/\bPOST\b/.test(existing)) {
        guide.because(`${shown} does not export POST, so the DevTools cannot send reports`);
        guide.step(`Open ${shown} and export POST too:`, 'export { POST } from "astralis-devtools/next/route";');
      }
    }
    return;
  }

  const problem = tryWrite(path, ROUTE_SOURCE, { dryRun });
  if (problem) return byHand(`couldn't be written: ${problem}`, true);
  out.changed();
  out.step(() =>
    ok(
      isOurs
        ? `${dryRun ? "would update" : "updated"} the DevTools route to take reports ${dim(`(${shown})`)}`
        : `${dryRun ? "would write" : "wrote"} the DevTools route ${dim(`(${shown})`)}`,
    ),
  );
}

function setUpVite({ cwd, dryRun, out, guide }) {
  const config = findViteConfig(cwd);
  if (!config) {
    guide.because("no vite.config was found");
    guide.step("Create vite.config.ts (vite.config.js in a JavaScript project) in your project's root with:", viteConfigSource);
    return;
  }
  const path = join(cwd, config);
  const { text: original, problem: readProblem } = tryRead(path);
  if (readProblem) {
    guide.because(`${config} couldn't be read: ${readProblem}`, { failed: true });
    pluginStep(guide, config);
    return;
  }
  let source = original;
  for (const result of devtoolsViteEdits(source)) {
    if (result.note) {
      guide.because(`${config}: ${result.note}`);
      pluginStep(guide, config);
      return;
    }
    source = result.source;
  }
  if (source === original) {
    out.step(() => ok(`DevTools plugin already in ${config}`));
    return;
  }
  const unparseable = !parses(source);
  const problem = unparseable ? null : tryWrite(path, source, { dryRun });
  if (unparseable || problem) {
    guide.because(unparseable ? `${config}: the edit would leave it unparseable, so nothing was written` : `${config} couldn't be written: ${problem}`, {
      failed: Boolean(problem),
    });
    pluginStep(guide, config);
    return;
  }
  out.changed();
  out.step(() => ok(`${dryRun ? "would add" : "added"} the DevTools plugin ${dim(`(${config})`)}`));
}

/**
 * Install the package and write the files outside the entry file (the Next.js
 * route; the Vite config). The Next.js layout edits go through init's own
 * pipeline via devtoolsLayoutEdits; `layoutProblem` says why they didn't happen
 * and `place` is the file they belong in. Returns { notes, guide }.
 */
export function setUpDevtools({ cwd, pkg, pm, framework, entry, place, layoutProblem, dryRun, out, command }) {
  const guide = createGuide({ title: "The DevTools aren't fully set up yet", docs: DOCS.devtools, check: CHECK_OPEN, retry: command });
  const result = { notes: [], guide };

  if (!framework) {
    guide.because("the DevTools run in Next.js and in React + Vite projects, and this is neither as far as init can tell");
    guide.step("If it is one of them, install the package:", `${pm} add -D ${PACKAGE}`);
    guide.step("In a Vite project, add the plugin to vite.config.ts:", `${VITE_IMPORT}\n\nplugins: [react(), ${VITE_PLUGIN}],`);
    guide.step("In a Next.js project, put this last inside <body> in app/layout.tsx:", `${NEXT_IMPORT}\n\n${NEXT_ELEMENT}`);
    guide.step("And, for Next.js only, create app/api/astralis-devtools/[...path]/route.ts with:", ROUTE_SOURCE);
    return result;
  }

  install({ cwd, pkg, pm, dryRun, out }, guide);
  if (framework === "next") {
    if (layoutProblem) {
      guide.because(layoutProblem);
      layoutStep(guide, place);
    }
    setUpRoute({ cwd, shown: entry ? routeFilePath(entry.relative) : routeFilePath(`${place.appDir}/layout.${/\.tsx$/.test(place.file) ? "tsx" : "js"}`), dryRun, out, guide });
  } else {
    setUpVite({ cwd, dryRun, out, guide });
  }
  if (!guide.needed) sayHowToOpen(out);
  return result;
}
