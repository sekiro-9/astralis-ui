import { parseArgs } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { themeCss, validateSeed, isEmptySeed } from "astralis-ui/serialize";
import { verifySeedContrast, parsePaletteFromCss } from "astralis-ui/contrast";
import { readFileSync as readFile } from "node:fs";
import { fileURLToPath } from "node:url";
import { ok, warn, fail, cyan, dim } from "../lib/ui.mjs";
import { readPackageJson, detectFramework, findEntryFile } from "../lib/detect.mjs";
import { addImports } from "../lib/edits.mjs";

/**
 * Renders a theme seed as a stylesheet — the static equivalent of
 * <AstralisProvider tokens={seed}>, for people who prefer build-time theming
 * over the runtime provider.
 *
 * Both the colour maths and the serialization come from the library and are
 * never duplicated here, so `astralis theme` and the provider cannot drift.
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

const USAGE = `Usage: astralis theme [options]

  Colours
    --brand <hex>          brand hue, e.g. "#8b5cf6"
    --gray <hex>           neutral hue — drives every surface, label and border,
                           and tints white/black so the page follows the neutral

  Status  (each seeds its own palette; the red/orange/green/blue hues and
           their colorScheme values are never altered)
    --error <hex>          defaults to red
    --warning <hex>        defaults to orange
    --success <hex>        defaults to green
    --info <hex>           defaults to blue

  Typefaces
    --font-heading <stack>
    --font-body <stack>
    --font-mono <stack>

  Scales (1 = library default; 0 is allowed)
    --radius <n>           border-radius multiplier
    --spacing <n>          spacing multiplier — the density dial
    --font-scale <n>       font-size multiplier
    --motion <n>           duration multiplier (0 disables transitions)

  Output
    --out <file>           default: src/astralis-theme.css, or
                           astralis-theme.css in a project with no src/
    --force                overwrite an existing file
    --no-import            write the file but don't touch the entry point

  A bare hex is shorthand for --brand:   astralis theme "#8b5cf6"`;

export async function run(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        ...Object.fromEntries(
          [...Object.keys(STRING_FLAGS), ...Object.keys(NUMBER_FLAGS)].map((f) => [f, { type: "string" }]),
        ),
        // No default: the destination depends on whether the project has a
        // src/, resolved below so `--out` can still override it.
        out: { type: "string" },
        "no-import": { type: "boolean", default: false },
        force: { type: "boolean", default: false },
        "strict-contrast": { type: "boolean", default: false },
        help: { type: "boolean", default: false },
      },
      allowPositionals: true,
    });
  } catch (error) {
    fail(`${error.message}\n\n${USAGE}`);
  }

  const { values, positionals } = parsed;
  if (values.help) {
    console.log(USAGE);
    return;
  }

  const seed = {};
  for (const [flag, field] of Object.entries(STRING_FLAGS)) {
    if (values[flag] !== undefined) seed[field] = values[flag];
  }
  for (const [flag, field] of Object.entries(NUMBER_FLAGS)) {
    if (values[flag] === undefined) continue;
    const n = Number(values[flag]);
    if (!Number.isFinite(n)) fail(`--${flag} expects a number, got "${values[flag]}".`);
    seed[field] = n;
  }

  // Back-compat: `astralis theme "#8b5cf6"` still means --brand.
  if (positionals[0]) {
    if (seed.brandColor) fail("Pass the brand colour as a positional OR as --brand, not both.");
    seed.brandColor = positionals[0].toLowerCase();
  }

  if (isEmptySeed(seed)) fail(`Nothing to generate — no theme options given.\n\n${USAGE}`);

  const issues = validateSeed(seed);
  if (issues.length) {
    fail(`Invalid theme options:\n${issues.map((i) => `    ${i.field}: ${i.message}`).join("\n")}`);
  }

  const cwd = process.cwd();
  const posix = (p) => p.split("\\").join("/");

  /*
   * Default next to the code that imports it, not at the project root — the
   * same rule `astralis add` follows for blocks. A stylesheet dropped beside
   * package.json is not where anyone looks for one.
   */
  const out = values.out ?? (existsSync(join(cwd, "src")) ? join("src", "astralis-theme.css") : "astralis-theme.css");

  if (existsSync(out) && !values.force) {
    fail(`${posix(out)} already exists — pass --force to overwrite.`);
  }

  writeFileSync(out, themeCss(seed));
  ok(`wrote ${cyan(posix(out))}`);

  /*
   * Contrast verification: the same WCAG contracts the library's own build
   * gate enforces, run against the palette THIS seed generates. A generated
   * theme nobody checked is exactly how a pale brand colour ships white-on-
   * mint buttons. Failures warn (the file is still written — the palette is
   * the user's call); --strict-contrast turns them into a non-zero exit.
   */
  try {
    const stylesPath = fileURLToPath(import.meta.resolve("astralis-ui/styles.css"));
    const palette = parsePaletteFromCss(readFile(stylesPath, "utf8"));
    const results = verifySeedContrast(seed, palette);
    const failures = results.filter((r) => !r.pass);
    if (failures.length === 0) {
      ok(`contrast: all ${results.length} promised pairings clear WCAG AA (light + dark)`);
    } else {
      for (const r of failures) {
        warn(
          `contrast: [${r.mode}] ${r.rule} — ${r.fgHex ?? "?"} on ${r.bgHex ?? "?"} is ` +
            `${r.ratio ? r.ratio.toFixed(2) : "unresolvable"}:1, needs ${r.min}:1`,
        );
      }
      warn(
        `${failures.length} of ${results.length} pairings fall below WCAG AA — a darker or lighter seed colour usually fixes it.`,
      );
      if (values["strict-contrast"]) fail("Failing under --strict-contrast.");
    }
  } catch (e) {
    warn(`contrast check skipped: ${e.message}`);
  }

  /*
   * Import it too. A generated stylesheet nobody imports changes nothing, and
   * the failure is invisible: the file exists, the command reported success,
   * and the brand colour is simply never applied.
   *
   * It goes after the last existing import, which puts it after
   * `astralis-ui/styles.css` — the order the override depends on.
   */
  const usesFont = seed.fontHeading || seed.fontBody || seed.fontMono;
  const pkg = readPackageJson(cwd);
  const entry = pkg ? findEntryFile(cwd, detectFramework(pkg)) : null;

  if (!values["no-import"] && entry) {
    const specifier = posix(relative(dirname(entry.path), join(cwd, out)));
    const line = `import "${specifier.startsWith(".") ? specifier : `./${specifier}`}";`;
    const result = addImports(readFileSync(entry.path, "utf8"), [line]);

    if (result.changed) {
      writeFileSync(entry.path, result.source);
      ok(`imported in ${cyan(entry.relative)} ${dim("(after the library stylesheet)")}`);
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

  if (usesFont) {
    console.log(dim("\nCustom fonts must be loaded by your app (next/font or a <link>)."));
  }
  console.log(dim("Runtime alternative: <AstralisProvider tokens={…}> — same math."));
}
