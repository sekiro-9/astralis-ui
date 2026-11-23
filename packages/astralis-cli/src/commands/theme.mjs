import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { ok, warn, fail, cyan, dim, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { readPackageJson, detectFramework, findEntryFile } from "../lib/detect.mjs";
import { addImports, parses } from "../lib/edits.mjs";
import { loadThemeLibrary } from "../lib/library.mjs";
import { DOCS, createGuide, formatGuide, printGuide, tryRead, tryWrite } from "../lib/manual.mjs";
import { likelyEntry } from "../lib/wiring.mjs";

/**
 * Renders a theme seed as a stylesheet: the static equivalent of
 * <AstralisProvider tokens={seed}>. The colour maths and serialization come
 * from the library, never duplicated here, so the two cannot drift.
 */

/** Flag -> seed field. */
const STRING_FLAGS = {
  brand: "brandColor",
  gray: "grayColor",
  error: "errorColor",
  warning: "warningColor",
  success: "successColor",
  info: "infoColor",
  "font-heading": "fontHeading",
  "font-body": "fontBody",
  "font-mono": "fontMono",
};

const NUMBER_FLAGS = {
  radius: "radiusScale",
  spacing: "spacingScale",
  "font-scale": "fontSizeScale",
  motion: "motionScale",
};

function seedFrom(values, positionals) {
  const seed = {};
  for (const [flag, field] of Object.entries(STRING_FLAGS)) {
    if (values[flag] !== undefined) seed[field] = values[flag];
  }
  for (const [flag, field] of Object.entries(NUMBER_FLAGS)) {
    if (values[flag] === undefined) continue;
    const n = Number(values[flag]);
    if (values[flag].trim() === "" || !Number.isFinite(n)) fail(`--${flag} expects a number, got "${values[flag]}".`);
    seed[field] = n;
  }
  // `astralis theme "#8b5cf6"` means --brand.
  if (positionals[0]) {
    if (seed.brandColor) fail("Pass the brand colour as an argument or as --brand, not both.");
    seed.brandColor = positionals[0].toLowerCase();
  }
  return seed;
}

/**
 * The same WCAG contracts the library's build gate enforces, run against the
 * palette this seed generates. Returns { results } or { skipped: reason }.
 */
function checkContrast(library, seed) {
  try {
    const palette = library.contrast.parsePaletteFromCss(readFileSync(library.stylesPath, "utf8"));
    return { results: library.contrast.verifySeedContrast(seed, palette) };
  } catch (error) {
    return { skipped: error.message };
  }
}

/**
 * The import line for the theme and the entry file it goes in. Without one the
 * CLI knows how to edit, `place` is the likeliest file and has no `path`.
 */
function themeImport(cwd, outPath) {
  const pkg = readPackageJson(cwd);
  const framework = pkg ? detectFramework(pkg) : null;
  const entry = findEntryFile(cwd, framework);
  const file = entry?.relative ?? (framework ? likelyEntry(cwd, framework).file : null);
  // With no framework the entry is unknown, and src/ is where most keep it.
  const dir = file ? dirname(join(cwd, file)) : existsSync(join(cwd, "src")) ? join(cwd, "src") : cwd;
  const specifier = posix(relative(dir, outPath));
  return {
    line: `import "${specifier.startsWith(".") ? specifier : `./${specifier}`}";`,
    place: { path: entry?.path, file: file ?? "the file your app starts from (often src/main.tsx or app/layout.tsx)" },
  };
}

/* Added with the theme when the entry lacks it (theme run before init): the
   theme only wins when it comes second, and init appends what is missing. */
const LIBRARY_IMPORT = 'import "astralis-ui/styles.css";';

/** This run's own command line, to print for running again. */
const rerun = (argv) => `npx astralis-cli theme ${argv.map((arg) => (/^[\w./=-]+$/.test(arg) ? arg : `"${arg}"`)).join(" ")}`;

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("theme"), argv);
  if (!args) return;
  const { values, positionals } = args;

  const seed = seedFrom(values, positionals);
  const cwd = process.cwd();
  const library = await loadThemeLibrary(cwd);
  if (library.broken) warn(`Your project's astralis-ui couldn't be loaded (${library.broken}); using the CLI's own copy.`);
  const { themeCss, validateSeed, isEmptySeed } = library.serialize;

  if (isEmptySeed(seed)) fail(`Nothing to generate: no theme options given. Run ${cyan("npx astralis-cli theme --help")}.`);
  const issues = validateSeed(seed);
  if (issues.length) {
    fail(`Invalid theme options:\n${issues.map((i) => `    ${i.field}: ${i.message}`).join("\n")}`);
  }

  // Next to the code that imports it, as `astralis add` does for blocks.
  const out = values.out ?? (existsSync(join(cwd, "src")) ? join("src", "astralis-theme.css") : "astralis-theme.css");
  const outPath = resolve(cwd, out);
  if (existsSync(outPath) && !values.force) fail(`${posix(out)} already exists — pass --force to overwrite.`);

  const strict = values["strict-contrast"];
  const contrast = checkContrast(library, seed);
  if (contrast.skipped) {
    if (strict) fail(`Couldn't verify contrast (${contrast.skipped}), so nothing was written under --strict-contrast.`);
    warn(`contrast check skipped: ${contrast.skipped}`);
  } else {
    const failures = contrast.results.filter((r) => !r.pass);
    for (const r of failures) {
      warn(
        `contrast: [${r.mode}] ${r.rule} — ${r.fgHex ?? "?"} on ${r.bgHex ?? "?"} is ` +
          `${r.ratio ? r.ratio.toFixed(2) : "unresolvable"}:1, needs ${r.min}:1`,
      );
    }
    if (failures.length === 0) {
      ok(`contrast: all ${contrast.results.length} promised pairings clear WCAG AA (light + dark)`);
    } else if (strict) {
      fail(`${failures.length} of ${contrast.results.length} pairings fall below WCAG AA — nothing written under --strict-contrast.`);
    } else {
      warn(`${failures.length} of ${contrast.results.length} pairings fall below WCAG AA — a darker or lighter seed usually fixes it.`);
    }
  }

  const shown = posix(out);
  const { line, place } = themeImport(cwd, outPath);
  const guide = createGuide({
    title: "The theme isn't applied yet",
    docs: DOCS.theme,
    check: seed.brandColor
      ? `start your dev server, open the page in the browser's inspector and select <html>: --astralis-color-brand-500 is ${seed.brandColor}.`
      : "start your dev server, open the page in the browser's inspector and select <html>: the values come from your theme file.",
  });
  const importLines = `import "astralis-ui/styles.css";\n${line}`;

  const writeProblem = tryWrite(outPath, themeCss(seed));
  if (writeProblem) {
    guide.because(`${shown} couldn't be written: ${writeProblem}`);
    guide.step("Make that file and its folder writable, then run this again. To write somewhere else, change --out:", rerun(values.out ? argv : [...argv, "--out", shown]));
    if (!values["no-import"]) guide.step(`If it then says the import is missing, open ${place.file} and add it after the library's stylesheet:`, importLines);
    fail(formatGuide(guide));
  }
  const from = library.source === "project" ? "your project's" : "the CLI's bundled";
  ok(`wrote ${cyan(shown)} ${dim(`(astralis-ui ${library.version}, ${from} copy)`)}`);
  if (library.outdated) {
    warn(`Your astralis-ui ${library.outdated} predates static themes; upgrade it so the file matches the library you ship.`);
  }

  // A generated stylesheet nobody imports changes nothing, silently.
  if (!values["no-import"]) {
    const { text, problem: readProblem } = place.path ? tryRead(place.path) : {};
    const result = text === undefined ? null : addImports(text, [LIBRARY_IMPORT, line]);
    if (!place.path) {
      guide.because("No Next.js or Vite entry point was found to import it in");
    } else if (readProblem) {
      guide.because(`${place.file} couldn't be read: ${readProblem}`);
    } else if (result.note || (result.changed && !parses(result.source))) {
      guide.because(`${place.file}: ${result.note ?? "it couldn't be edited safely, so it was left alone"}`);
    } else if (!result.changed) {
      ok(`already imported in ${cyan(place.file)}`);
    } else {
      const problem = tryWrite(place.path, result.source);
      if (problem) guide.because(`${place.file} couldn't be written: ${problem}`);
      else ok(`imported in ${cyan(place.file)} ${dim("(after the library stylesheet)")}`);
    }
    if (guide.needed) guide.step(`Open ${place.file} and add your theme after the library's stylesheet. It must come second:`, importLines);
    printGuide(guide);
  }

  if (seed.fontHeading || seed.fontBody || seed.fontMono) {
    console.log(dim("\nCustom fonts must be loaded by your app (next/font or a <link>)."));
  }
  console.log(dim("Runtime alternative: <AstralisProvider tokens={…}> — same math."));
}
