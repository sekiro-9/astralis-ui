/* ==========================================================================
   ASTRALIS — SYSTEM SPEC EMITTER
   --------------------------------------------------------------------------
   Compiles the design system into ONE machine-verifiable artifact:
   dist/system-spec.json. MCP and llms.txt describe the system to machines;
   this file is what lets a machine CHECK code against it — the ground truth
   for `astralis validate`, the generate loop, and any external tool.

   Everything here is DERIVED from what ships, never hand-authored twice:
   - prop vocabularies from the same variant maps the engine resolves against
     (imported from dist, so the spec describes the built package);
   - channel routing mirrors the runtime rule exactly: prop name registered
     in CHANNEL_PROPS AND the map carries the channel brand;
   - the class inventory from the compiled dist/styles.css, same extraction
     as check-css-coverage.mjs — a class absent here is a class that
     silently does nothing, which is precisely what a validator must catch;
   - declared CSS variables from the token stylesheets.

   The two authored tables (PRIMITIVE_GROUPS, PLACEMENT_ADOPTERS) are
   transcriptions of tested behaviour (placement-props.test.tsx's adopter
   table) and are drift-checked against the real export list — an entry that
   stops existing fails this script, not the consumer.

   Runs at the end of build:css, after the coverage gate has proven the CSS
   is total, so the spec can only ever describe a verified build.
   ========================================================================== */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, "..");
const distUrl = (p) => pathToFileURL(join(PKG, "dist", p)).href;

const CHANNEL_MAP_BRAND = Symbol.for("astralis.channel-map");

const problems = [];
const fail = (msg) => problems.push(msg);

/* ---- meta ---------------------------------------------------------------- */
const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));

/* ---- breakpoints (same source the coverage gate checks for drift) -------- */
const entryCss = readFileSync(join(PKG, "src", "tailwind-entry.css"), "utf8");
const breakpoints = {};
for (const bp of ["sm", "md", "lg", "xl"]) {
  const m = entryCss.match(new RegExp(`--breakpoint-${bp}:\\s*([\\d.]+rem)`));
  if (m) breakpoints[bp] = m[1];
  else fail(`--breakpoint-${bp} not declared in tailwind-entry.css`);
}

/* ---- engine constants, from the built package ---------------------------- */
const { CHANNEL_PROPS, UNITLESS_CHANNEL_SLUGS } = await import(distUrl("const/channel.js"));
const { STATE_VARIANTS, STATE_STYLE_MAPS } = await import(distUrl("utils/interaction-state.js"));
const { PLACEMENT_PROP_NAMES } = await import(distUrl("utils/placement.js"));

/* ---- prop groups: the vocabularies the engine actually resolves against -- */
const { boxVariantMap } = await import(distUrl("components/layout/box/box.styles.js"));
const { flexVariantMap, flexItemVariantMap } = await import(
  distUrl("components/layout/flex/flex.style.js"),
);
const { gridVariantMap, gridItemVariantMap } = await import(
  distUrl("components/layout/grid/grid.styles.js"),
);
const { textVariantMap } = await import(distUrl("components/typography/text/text.styles.js"));

/** One prop's spec entry. Channel routing mirrors the engine: registered
 *  name AND branded map — Text's `size` stays keyword here for the same
 *  reason it stays keyword at runtime. */
function propSpec(prop, tokenMap) {
  const isChannel = prop in CHANNEL_PROPS && tokenMap[CHANNEL_MAP_BRAND] === true;
  const tokens = Object.keys(tokenMap);
  if (tokens.length === 0) fail(`prop "${prop}" has an empty token map`);
  if (isChannel) {
    const slug = CHANNEL_PROPS[prop];
    return {
      kind: "channel",
      slug,
      tokens,
      arbitrary: true,
      unitless: UNITLESS_CHANNEL_SLUGS.has(slug),
    };
  }
  return { kind: "keyword", tokens, arbitrary: false };
}

const groupSpec = (map) =>
  Object.fromEntries(Object.entries(map).map(([prop, m]) => [prop, propSpec(prop, m)]));

const box = groupSpec(boxVariantMap);
const flex = groupSpec(flexVariantMap);
const propGroups = {
  box,
  flex,
  flexItem: groupSpec(flexItemVariantMap),
  grid: groupSpec(gridVariantMap),
  gridItem: groupSpec(gridItemVariantMap),
  text: groupSpec(textVariantMap),
  // Stack is Flex minus `direction` plus its own axis vocabulary
  // (stack.types.ts) — claiming the flex group as-is would bless
  // direction="row" on Stack, which the type system rejects.
  stack: { ...flex, direction: { kind: "keyword", tokens: ["horizontal", "vertical"], arbitrary: false } },
  // The subset every recipe component accepts (splitPlacement's contract).
  placement: Object.fromEntries(
    PLACEMENT_PROP_NAMES.map((p) => {
      if (!box[p]) fail(`placement prop "${p}" missing from the box group`);
      return [p, box[p]];
    }),
  ),
};

/* ---- components ----------------------------------------------------------- */
const rootExports = await import(distUrl("index.js"));
const componentNames = Object.keys(rootExports)
  // Capitalized, but not ALL_CAPS constants (BOX_STYLE_TOKENS, COLOR_SCHEMES...).
  // Plain /^[A-Z][a-z]/ is the tempting version — it drops HStack and VStack.
  .filter((k) => /^[A-Z]/.test(k) && !/^[A-Z0-9_]+$/.test(k))
  .filter((k) => {
    const v = rootExports[k];
    return typeof v === "function" || (typeof v === "object" && v !== null);
  })
  .sort();

/* Style-prop surfaces per component. Two authored tables, both transcribed
   from tested behaviour and drift-checked against the export list above.
   Components in neither table get [] — meaning "props manifest pending",
   NOT "accepts nothing"; the react-docgen manifest is the planned upgrade. */
const PRIMITIVE_GROUPS = {
  Box: ["box"],
  Flex: ["box", "flex"],
  FlexItem: ["box", "flexItem"],
  Grid: ["box", "grid"],
  GridItem: ["box", "gridItem"],
  Stack: ["box", "stack"],
  HStack: ["box", "stack"],
  VStack: ["box", "stack"],
  Center: ["box"],
  Container: ["box"],
  AspectRatio: ["box"],
  Float: ["box"],
  Text: ["text", "placement"],
  Heading: ["text", "placement"],
  Link: ["text", "placement"],
};

// Transcribed from placement-props.test.tsx (the 39-adopter table + Card).
const PLACEMENT_ADOPTERS = [
  "Accordion", "Alert", "Avatar", "Badge", "Breadcrumb", "Button",
  "ButtonGroup", "Calendar", "Card", "Carousel", "Checkbox", "CodeBlock",
  "Combobox", "DataList", "Field", "Highlight", "Icon", "Image", "Input",
  "Kbd", "Marquee", "MultiSelect", "NumberInput", "Pagination", "PinInput",
  "Progress", "QrCode", "Radio", "Skeleton", "Slider", "Spinner", "Steps",
  "Switch", "Table", "Tabs", "Tag", "Timeline",
];

const exportSet = new Set(componentNames);
for (const name of [...Object.keys(PRIMITIVE_GROUPS), ...PLACEMENT_ADOPTERS]) {
  if (!exportSet.has(name)) fail(`authored table names "${name}", which is not exported`);
}

/* Props deliberately typed away on specific components — the validator turns
   these into targeted errors instead of "unknown prop" shrugs. */
const EXCLUDED_PROPS = {
  // `size` is typed `never` — Container has no scale of its own; use maxW.
  Container: ["size"],
  // Presets fix the axis; direction is omitted from their props entirely.
  HStack: ["direction"],
  VStack: ["direction"],
};

const components = Object.fromEntries(
  componentNames.map((name) => {
    const groups = PRIMITIVE_GROUPS[name] ?? (PLACEMENT_ADOPTERS.includes(name) ? ["placement"] : []);
    const entry = { groups };
    if (EXCLUDED_PROPS[name]) entry.exclude = EXCLUDED_PROPS[name];
    return [name, entry];
  }),
);

/* ---- class inventory (same extraction as the coverage gate) --------------- */
const css = readFileSync(join(PKG, "dist", "styles.css"), "utf8");
const classSet = new Set();
for (const m of css.matchAll(/\.((?:[^\s{},.:#()[\]>+~\\'"]|\\.)+)/g)) {
  const name = m[1].replace(/\\(.)/g, "$1");
  if (name.startsWith("astralis")) classSet.add(name);
}
const classes = [...classSet].sort();

/* ---- declared token variables --------------------------------------------- */
const varSet = new Set();
const tokensDir = join(PKG, "src", "theme", "tokens");
for (const f of readdirSync(tokensDir)) {
  if (!f.endsWith(".css")) continue;
  const text = readFileSync(join(tokensDir, f), "utf8");
  for (const m of text.matchAll(/(--astralis-[\w\\./-]+)\s*:/g)) {
    varSet.add(m[1].replace(/\\(.)/g, "$1"));
  }
}
const cssVariables = [...varSet].sort();

/* ---- sanity: a spec describing an implausible build must not ship --------- */
if (componentNames.length < 100) fail(`only ${componentNames.length} components found`);
if (classes.length < 2000) fail(`only ${classes.length} astralis classes found in dist/styles.css`);
if (cssVariables.length < 100) fail(`only ${cssVariables.length} token variables found`);
if (Object.keys(box).length < 50) fail(`box group has only ${Object.keys(box).length} props`);

if (problems.length) {
  console.error(`[astralis] SYSTEM SPEC FAILURE — ${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

/* ---- emit ------------------------------------------------------------------ */
const spec = {
  name: pkg.name,
  version: pkg.version,
  specVersion: 1,
  // What this version can and cannot answer; consumers should branch on it.
  propsManifest: "style-props-v1",
  generatedAt: new Date().toISOString(),
  breakpoints,
  states: STATE_VARIANTS,
  stateableProps: Object.keys(STATE_STYLE_MAPS).sort(),
  channelProps: CHANNEL_PROPS,
  propGroups,
  components,
  classes,
  cssVariables,
};

const out = join(PKG, "dist", "system-spec.json");
writeFileSync(out, JSON.stringify(spec, null, 2) + "\n");

const tokenCount = Object.values(propGroups)
  .flatMap((g) => Object.values(g))
  .reduce((n, p) => n + p.tokens.length, 0);
console.log(
  `[astralis] system spec: ${componentNames.length} components | ` +
    `${Object.keys(propGroups).length} prop groups, ${tokenCount} tokens | ` +
    `${classes.length} classes | ${cssVariables.length} variables -> dist/system-spec.json`,
);
