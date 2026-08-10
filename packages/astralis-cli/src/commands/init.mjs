import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { readPackageJson, detectPackageManager, detectFramework, findEntryFile } from "../lib/detect.mjs";
import { addImports, wrapJsx, addTagAttribute, insertAfterBodyTag, addStatementAfterImports } from "../lib/edits.mjs";
import { ok, warn, info, fail, bold, dim, cyan } from "../lib/ui.mjs";

const PROVIDER_IMPORT = 'import { AstralisProvider } from "astralis-ui";';
const STYLES_IMPORT = 'import "astralis-ui/styles.css";';

// Applies `.astralis-dark` before first paint so a stored/system dark
// preference never flashes light (same script the Astralis docs site uses).
const THEME_INIT_CONST =
  'const astralisThemeInit = `(function(){try{var t=localStorage.getItem("astralis-ui-theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("astralis-dark");}catch(e){}})();`;';
const THEME_INIT_SCRIPT = '\n        <script dangerouslySetInnerHTML={{ __html: astralisThemeInit }} />';

const MANUAL_SNIPPET = `
  ${bold("Manual setup:")}
    1. ${PROVIDER_IMPORT}
    2. ${STYLES_IMPORT}   ${dim("(once, at your entry point)")}
    3. Wrap your app:  <AstralisProvider defaultTheme="system">…</AstralisProvider>
  Full guide: ${cyan("https://astralis-zeta.vercel.app/docs/installation")}`;

/**
 * `nested` is set when `create` calls this as its wiring step. It suppresses
 * the sign-off, because create prints its own "Next steps" immediately after —
 * two closing blocks in one run read as the command finishing twice.
 */
export async function run(argv, { nested = false } = {}) {
  const { values } = parseArgs({
    args: argv,
    options: { "dry-run": { type: "boolean", default: false } },
  });
  const dryRun = values["dry-run"];
  const cwd = process.cwd();

  const pkg = readPackageJson(cwd);
  if (!pkg) fail("No package.json here — run `astralis init` from your project root.");

  const framework = detectFramework(pkg);
  if (!framework) {
    // Be specific about which half is missing. A Vue + Vite app used to be
    // told "couldn't detect Vite", which is untrue and points at the wrong
    // problem — Vite is there, React is not.
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.vite) {
      warn("This is a Vite project, but not a React one.");
      console.log(
        dim("  Astralis is a React library — react and react-dom are its peer dependencies."),
      );
    } else {
      warn("Couldn't detect Next.js or a React + Vite project here.");
    }
    console.log(MANUAL_SNIPPET);
    return;
  }
  const pm = detectPackageManager(cwd);

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
  let printing = false;
  let changed = false;
  const step = (fn) => (printing ? fn() : steps.push(fn));
  const flush = () => {
    for (const fn of steps) fn();
    steps.length = 0;
    printing = true;
  };

  step(() =>
    info(
      `${bold(framework === "next" ? "Next.js" : "Vite")} project, ${bold(pm)}${dryRun ? dim("  (dry run — nothing will be written)") : ""}`,
    ),
  );

  // 1. Dependency
  const hasDep = Boolean(pkg.dependencies?.["astralis-ui"] ?? pkg.devDependencies?.["astralis-ui"]);
  if (hasDep) {
    step(() => ok("astralis-ui already in dependencies"));
  } else if (dryRun) {
    changed = true;
    step(() => info(`would run: ${pm} add astralis-ui`));
  } else {
    changed = true;
    flush();
    info(`installing astralis-ui with ${pm}…`);
    // One command string: pm binaries are .cmd shims on Windows (need a shell),
    // and shell+args-array triggers Node's unescaped-args deprecation.
    const result = spawnSync(`${pm} add astralis-ui`, { stdio: "inherit", shell: true });
    if (result.status !== 0) fail(`${pm} add astralis-ui failed — install it manually, then re-run init.`);
    ok("astralis-ui installed");
  }

  // 2. Entry file
  const entry = findEntryFile(cwd, framework);
  if (!entry) {
    warn(`Couldn't find your ${framework === "next" ? "root layout" : "src/main.tsx"} — wire the provider manually:`);
    console.log(MANUAL_SNIPPET);
    return;
  }

  let source = readFileSync(entry.path, "utf8");
  const original = source;
  const notes = [];
  const apply = (result, label) => {
    source = result.source;
    if (result.changed) {
      changed = true;
      step(() => ok(`${label} ${dim(`(${entry.relative})`)}`));
    } else if (result.note) notes.push(`${label}: ${result.note}`);
    else step(() => ok(`${label} — already present`));
  };

  apply(addImports(source, [PROVIDER_IMPORT, STYLES_IMPORT]), "imports added");

  if (source.includes("<AstralisProvider")) {
    step(() => ok("AstralisProvider already wraps this file"));
  } else if (framework === "next") {
    apply(
      wrapJsx(source, "{children}", '<AstralisProvider defaultTheme="system">', "</AstralisProvider>"),
      "provider wrapped around {children}",
    );
  } else {
    apply(
      wrapJsx(source, "<App />", '<AstralisProvider defaultTheme="system">', "</AstralisProvider>"),
      "provider wrapped around <App />",
    );
  }

  if (framework === "next") {
    apply(addStatementAfterImports(source, THEME_INIT_CONST), "anti-flash theme script const");
    apply(insertAfterBodyTag(source, THEME_INIT_SCRIPT), "theme script injected after <body>");
    apply(addTagAttribute(source, "html", "suppressHydrationWarning"), "suppressHydrationWarning on <html>");
  }

  // 3. Write
  if (source !== original) {
    if (dryRun) step(() => info(`would update ${entry.relative}`));
    else writeFileSync(entry.path, source);
  }

  /*
   * Nothing to do, and nothing that needed the reader's attention: say so in
   * one line instead of listing the steps that were already satisfied.
   */
  if (!changed && notes.length === 0) {
    ok("astralis-ui is already present in this project");
    if (nested) return;
    console.log(`Nothing to scaffold.\nDocs: ${cyan("https://astralis-zeta.vercel.app/docs")}`);
    return;
  }

  flush();

  for (const note of notes) warn(note);
  if (notes.length > 0) console.log(MANUAL_SNIPPET);

  if (nested) return;

  console.log(`\n${bold("Done.")} Try it:\n  ${cyan('import { Button } from "astralis-ui";')}\n  ${cyan('<Button colorScheme="teal">Hello</Button>')}\nDocs: ${cyan("https://astralis-zeta.vercel.app/docs")}`);
}
