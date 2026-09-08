import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { ok, warn, fail, cyan, dim, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { readPackageJson, detectFramework, findEntryFile } from "../lib/detect.mjs";
import { addImports, parses } from "../lib/edits.mjs";
import { loadThemeLibrary } from "../lib/library.mjs";

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

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("theme"), argv);
  if (!args) return;
  const { values, positionals } = args;

  const seed = seedFrom(values, positionals);
  const cwd = process.cwd();
  const library = await loadThemeLibrary(cwd);
  const { themeCss, validateSeed, isEmptySeed } = library.serialize;

  if (isEmptySeed(seed)) fail(`Nothing to generate: no theme options given. Run ${cyan("astralis theme --help")}.`);
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

  writeFileSync(outPath, themeCss(seed));
  const from = library.source === "project" ? "your project's" : "the CLI's bundled";
  ok(`wrote ${cyan(posix(out))} ${dim(`(astralis-ui ${library.version}, ${from} copy)`)}`);
  if (library.outdated) {
    warn(`Your astralis-ui ${library.outdated} predates static themes; upgrade it so the file matches the library you ship.`);
  }

  // A generated stylesheet nobody imports changes nothing, silently. After the
  // last import is after astralis-ui/styles.css: the order the override needs.
  const pkg = readPackageJson(cwd);
  const entry = pkg ? findEntryFile(cwd, detectFramework(pkg)) : null;
  const specifier = entry ? posix(relative(dirname(entry.path), outPath)) : null;
  const line = specifier ? `import "${specifier.startsWith(".") ? specifier : `./${specifier}`}";` : null;

  if (!values["no-import"] && entry) {
    const result = addImports(readFileSync(entry.path, "utf8"), [line]);
    if (result.changed && parses(result.source)) {
      writeFileSync(entry.path, result.source);
      ok(`imported in ${cyan(entry.relative)} ${dim("(after the library stylesheet)")}`);
    } else if (result.changed || result.note) {
      warn(`${entry.relative} ${result.note ?? "couldn't be edited safely"} — add this after the library stylesheet:`);
      console.log(`  ${cyan(line)}`);
    } else {
      ok(`already imported in ${cyan(entry.relative)}`);
    }
  } else if (!values["no-import"]) {
    warn("No Next.js or Vite entry point found — import it yourself:");
    console.log(
      `  ${cyan('import "astralis-ui/styles.css";')}\n` +
        `  ${cyan(`import "./${posix(out)}";`)}  ${dim("← must come second")}`,
    );
  }

  if (seed.fontHeading || seed.fontBody || seed.fontMono) {
    console.log(dim("\nCustom fonts must be loaded by your app (next/font or a <link>)."));
  }
  console.log(dim("Runtime alternative: <AstralisProvider tokens={…}> — same math."));
}
