import { existsSync } from "node:fs";
import { join } from "node:path";
import { readPackageJson, detectPackageManager, detectFramework, findEntryFile } from "../lib/detect.mjs";
import { addImports, wrapJsx, addTagAttribute, insertAfterBodyTag, addStatementAfterImports, parses } from "../lib/edits.mjs";
import { ok, warn, info, fail, bold, dim, cyan, printBanner } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { runCommand } from "../lib/run.mjs";
import { setUpCi } from "../lib/ci-setup.mjs";
import { devtoolsLayoutEdits, setUpDevtools } from "../lib/devtools-setup.mjs";
import { DOCS, commandProblem, createGuide, formatGuide, printGuide, tryRead, tryWrite } from "../lib/manual.mjs";
import {
  PROVIDER_CLOSE,
  PROVIDER_IMPORT,
  PROVIDER_OPEN,
  STYLES_IMPORT,
  THEME_INIT_CONST,
  THEME_INIT_ELEMENT,
  addWiringSteps,
  likelyEntry,
} from "../lib/wiring.mjs";

const CHECK_WIRING =
  "start your dev server and put <Button>Hello</Button> from astralis-ui on a page. It shows as a styled button, in light and in dark mode.";

/** package.json is missing or unreadable: nothing can be wired, so init has failed. */
function failWithoutPackage(cwd) {
  const path = join(cwd, "package.json");
  if (!existsSync(path)) {
    const guide = createGuide({ title: "No package.json here", docs: DOCS.byHand })
      .because("init has to run in your project's root, and this folder isn't one")
      .step("Go to the folder that holds your project's package.json, then run init:", "cd path/to/your-project\nnpx astralis-cli init")
      .step("Or start a new project:", "npx astralis-cli create my-app");
    fail(formatGuide(guide));
  }
  const { problem } = tryRead(path);
  const guide = createGuide({ title: "package.json couldn't be read", docs: DOCS.byHand, retry: "npx astralis-cli init" })
    .because(`${problem ?? "it isn't valid JSON"}, so nothing was changed`)
    .step(problem ? "Open package.json's properties and allow yourself to read it." : "Open package.json and fix the JSON. This prints where it breaks:", problem ? undefined : "npm pkg get name")
    .step("Or wire Astralis in without the CLI: the guide below has every step.");
  fail(formatGuide(guide));
}

/**
 * Every edit the entry file needs, applied to its text. Each is
 * { id, label, status, what?, note? }; a "declined" one left the text alone.
 */
function editEntry(source, framework, devtools) {
  const edits = [];
  // The parts of one edit stand or fall together: an import whose element has no place is only a lint error.
  const apply = (id, label, what, results) => {
    const note = results.find((r) => r.note)?.note;
    const changed = results.some((r) => r.changed);
    if (!note) source = results.at(-1).source;
    edits.push({ id, label, what, note, status: note ? "declined" : changed ? "done" : "present" });
  };

  apply("imports", "imports added", "the imports", [addImports(source, [PROVIDER_IMPORT, STYLES_IMPORT])]);

  const child = framework === "next" ? "{children}" : "<App />";
  if (source.includes("<AstralisProvider")) {
    edits.push({ id: "provider", status: "wrapped" });
  } else {
    apply("provider", `provider wrapped around ${child}`, "the provider", [wrapJsx(source, child, PROVIDER_OPEN, PROVIDER_CLOSE)]);
  }

  if (framework === "next") {
    const declared = addStatementAfterImports(source, THEME_INIT_CONST);
    const placed = insertAfterBodyTag(declared.source, `\n        ${THEME_INIT_ELEMENT}`);
    apply("themeScript", "theme script injected after <body>", "the dark mode script", [declared, placed]);
    apply("html", "suppressHydrationWarning on <html>", "suppressHydrationWarning", [addTagAttribute(source, "html", "suppressHydrationWarning")]);
    if (devtools) apply("devtools", "<AstralisDevTools /> placed before </body>", "the DevTools", devtoolsLayoutEdits(source));
  }
  return { source, edits };
}

/**
 * `nested` is set when `create` calls this as its wiring step. It suppresses
 * the sign-off, because create prints its own "Next steps" immediately after —
 * two closing blocks in one run read as the command finishing twice. `pm` is
 * create's package manager: a fresh scaffold has no lockfile to detect it from.
 */
export async function run(argv, { nested = false, pm: givenPm } = {}) {
  const args = parseCommandArgs(commandNamed("init"), argv);
  if (!args) return;
  const dryRun = args.values["dry-run"];
  const ci = args.values.ci;
  const devtools = args.values.devtools;
  if (args.values.force && !ci) fail("--force only applies with --ci (it replaces an existing workflow).");
  const cwd = process.cwd();
  if (!nested) printBanner(ci ? "Setting up validation in CI" : devtools ? "Adding the DevTools" : "Adding Astralis UI to this project");

  const pkg = readPackageJson(cwd);
  if (!pkg) failWithoutPackage(cwd);

  const framework = detectFramework(pkg);
  const pm = givenPm ?? detectPackageManager(cwd);
  const command = ["npx astralis-cli init", devtools && "--devtools", ci && "--ci"].filter(Boolean).join(" ");
  const hasDep = Boolean(pkg.dependencies?.["astralis-ui"] ?? pkg.devDependencies?.["astralis-ui"]);
  const notes = [];
  const guides = [];
  /*
   * Step output is buffered until we know whether anything actually changed.
   * Re-running init on an already-wired project used to print a checklist of
   * things it had not done, followed by a sign-off — reading like work when
   * the honest answer is "nothing to do".
   *
   * The moment a real change happens we flush and switch to printing live, so
   * a package-manager install still streams in order.
   */
  const steps = [];
  const afterwards = [];
  let printing = false;
  let changed = false;
  const step = (fn) => (printing ? fn() : steps.push(fn));
  const flush = () => {
    for (const fn of steps) fn();
    steps.length = 0;
    printing = true;
  };
  const out = { step, flush, changed: () => (changed = true), after: (fn) => afterwards.push(fn) };

  const setUpExtras = (context) => {
    for (const [wanted, setUp] of [[devtools, setUpDevtools], [ci, setUpCi]]) {
      if (!wanted) continue;
      const result = setUp({ cwd, pkg, pm, framework, dryRun, force: args.values.force, out, command, ...context });
      notes.push(...result.notes);
      guides.push(result.guide);
    }
  };
  const report = () => {
    flush();
    for (const note of notes) warn(note);
    for (const guide of guides) printGuide(guide);
    for (const fn of afterwards) fn();
  };

  if (!framework) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const guide = createGuide({ title: "Astralis couldn't be wired in", docs: DOCS.byHand, check: CHECK_WIRING });
    guides.push(guide);
    // Be specific about which half is missing: a Vue + Vite app does have Vite.
    if (deps.react) {
      guide.because("Couldn't detect Next.js or a React + Vite project here, so there is no entry file init knows how to edit");
    } else {
      const found = deps.vite ? "This is a Vite project, but not a React one" : "Couldn't detect Next.js or a React + Vite project here";
      guide.because(`${found}. Astralis is a React library, and react is not in package.json`);
      guide.step("Use a React 19 project, or add React to this one:", `${pm} add react react-dom`);
    }
    if (!hasDep) guide.step("Install Astralis from your project's root:", `${pm} add astralis-ui`);
    addWiringSteps(guide, { file: "the file your app starts from (often src/main.tsx, src/index.tsx or src/root.tsx)", kind: "vite" });
    setUpExtras({ entry: null, place: null, layoutProblem: null });
    report();
    return;
  }

  step(() =>
    info(
      `${bold(framework === "next" ? "Next.js" : "Vite")} project, ${bold(pm)}${dryRun ? dim("  (dry run — nothing will be written)") : ""}`,
    ),
  );

  // 1. Dependency
  const entry = findEntryFile(cwd, framework);
  const place = entry ? { file: entry.relative, kind: framework } : likelyEntry(cwd, framework);
  const wiring = createGuide({ title: "Astralis isn't fully wired in yet", docs: DOCS[place.kind], check: CHECK_WIRING, retry: command });
  guides.push(wiring);
  if (hasDep) {
    step(() => ok("astralis-ui already in dependencies"));
  } else if (dryRun) {
    changed = true;
    step(() => info(`would run: ${pm} add astralis-ui`));
  } else {
    changed = true;
    flush();
    info(`installing astralis-ui with ${pm}…`);
    const result = runCommand(pm, ["add", "astralis-ui"]);
    if (result.status === 0) {
      ok("astralis-ui installed");
    } else {
      warn(`${pm} add astralis-ui failed; carrying on with the rest`);
      wiring.because(`astralis-ui wasn't installed: ${commandProblem(result)}`, { failed: true });
      wiring.step("Install it from your project's root:", `${pm} add astralis-ui`);
    }
  }

  // 2. Entry file
  // Why the layout has no <AstralisDevTools /> when it should; setUpDevtools gives the step.
  let layoutProblem = null;

  const { text: original, problem: readProblem } = entry ? tryRead(entry.path) : {};
  if (!entry) {
    wiring.because(
      place.kind === "nextPages"
        ? `Couldn't find your root layout: this project uses the Pages Router (${place.file}), which init doesn't edit`
        : `Couldn't find your ${framework === "next" ? "root layout (looked for app/layout and src/app/layout)" : "entry file (looked for src/main.tsx and src/main.jsx)"}`,
    );
    addWiringSteps(wiring, place);
    layoutProblem = "no root layout was found to put <AstralisDevTools /> in";
  } else if (readProblem || !parses(original)) {
    const why = readProblem ? `${entry.relative} couldn't be read: ${readProblem}` : `${entry.relative} doesn't parse, so it was left alone`;
    wiring.because(why, { failed: Boolean(readProblem) });
    addWiringSteps(wiring, place);
    layoutProblem = why;
  } else {
    const { source, edits } = editEntry(original, framework, devtools);
    const unparseable = source !== original && !parses(source);
    const writeProblem = source === original || unparseable ? null : tryWrite(entry.path, source, { dryRun });

    if (unparseable || writeProblem) {
      const why = unparseable
        ? `${entry.relative}: the edits would leave it unparseable, so nothing was written`
        : `${entry.relative} couldn't be written: ${writeProblem}`;
      const needed = edits.filter((edit) => edit.status === "done" || edit.status === "declined").map((edit) => edit.id);
      const own = needed.filter((id) => id !== "devtools");
      if (own.length > 0) {
        wiring.because(why, { failed: Boolean(writeProblem) });
        addWiringSteps(wiring, place, own);
      }
      if (needed.includes("devtools")) layoutProblem = why;
      if (writeProblem) process.exitCode = 1;
    } else {
      for (const edit of edits) {
        if (edit.status === "done") {
          changed = true;
          step(() => ok(`${edit.label} ${dim(`(${entry.relative})`)}`));
        } else if (edit.status === "present") {
          step(() => ok(`${edit.label} — already present`));
        } else if (edit.status === "wrapped") {
          step(() => ok("AstralisProvider already wraps this file"));
        } else if (edit.id === "devtools") {
          layoutProblem = `${entry.relative}: ${edit.note}`;
        } else {
          wiring.because(`${edit.what}, in ${entry.relative}: ${edit.note}`);
          addWiringSteps(wiring, place, [edit.id]);
        }
      }
      if (dryRun && source !== original) step(() => info(`would update ${entry.relative}`));
    }
  }

  // 3. DevTools and CI
  setUpExtras({ entry, place, layoutProblem });
  const needsHand = guides.some((guide) => guide.needed);

  /*
   * Nothing to do, and nothing that needed the reader's attention: say so in
   * one line instead of listing the steps that were already satisfied.
   */
  if (!changed && notes.length === 0 && !needsHand) {
    const extras = [devtools && "the DevTools", ci && "its CI check"].filter(Boolean);
    ok(
      extras.length
        ? `astralis-ui and ${extras.join(" and ")} are already set up in this project`
        : "astralis-ui is already present in this project",
    );
    if (nested) return;
    console.log(`Nothing to scaffold.\nDocs: ${cyan("https://astralis-ui.com/docs")}`);
    return;
  }

  report();

  if (nested || !changed) return;

  if (dryRun) {
    console.log(`\n${bold("Dry run:")} nothing was written. Run ${cyan(command)} to apply it.`);
    return;
  }
  if (needsHand) return;
  console.log(`\n${bold("Done.")} Try it:\n  ${cyan('import { Button } from "astralis-ui";')}\n  ${cyan('<Button colorScheme="teal">Hello</Button>')}\nDocs: ${cyan("https://astralis-ui.com/docs")}`);
}
