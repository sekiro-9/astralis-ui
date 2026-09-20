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

   Two lists are authored: PRIMITIVE_GROUPS here, and PLACEMENT_ADOPTERS in
   utils/placement.ts, which placement-props.test.tsx covers. Both are
   drift-checked against the real export list — an entry that stops existing
   fails this script, not the consumer.

   Runs at the end of build:css, after the coverage gate has proven the CSS
   is total, so the spec can only ever describe a verified build.
   ========================================================================== */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { buildGraph, classifyClient, exportsOf } from "./module-graph.mjs";
import { extractComponentTypes } from "./extract-literal-props.mjs";
import { measureContent } from "./measure-content.mjs";
import { loadTs } from "./load-ts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, "..");
const distUrl = (p) => pathToFileURL(join(PKG, "dist", p)).href;

const CHANNEL_MAP_BRAND = Symbol.for("astralis.channel-map");

const problems = [];
const fail = (msg) => problems.push(msg);

/* ---- meta ---------------------------------------------------------------- */
const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));

/* ---- breakpoints ---------------------------------------------------------- */
const { BREAKPOINT_WIDTHS } = await import(distUrl("const/breakpoints.js"));
const breakpoints = { ...BREAKPOINT_WIDTHS };
/* Container-query responsive keys (@sm..@xl) — same thresholds as the
   viewport breakpoints, resolved against the nearest `container` ancestor.
   Read from the built package so the spec can never drift from the engine. */
const { CONTAINER_BREAKPOINT_WIDTHS } = await import(distUrl("const/channel.js"));

/* Contrast contracts — the promised WCAG pairings (text and non-text), verified against
   the shipped palette by scripts/check-contrast.mjs earlier in this same
   build. Emitted so agents and docs can see WHAT is promised; the ratios are
   facts about this exact version's palette. */
const { verifyContrast, parsePaletteFromCss } = await import(distUrl("theme/contrast.js"));
const shippedPalette = parsePaletteFromCss(readFileSync(join(PKG, "src", "theme", "tokens", "color.css"), "utf8"));
const contrast = {};
for (const mode of ["light", "dark"]) {
  contrast[mode] = verifyContrast((ref) => shippedPalette[ref], mode).map((r) => ({
    rule: r.rule, fg: r.fg, bg: r.bg, min: r.min, ratio: r.ratio === undefined ? null : Math.round(r.ratio * 100) / 100, pass: r.pass,
  }));
  if (contrast[mode].some((r) => !r.pass)) fail(`contrast contract failing in spec emission (${mode}) — gate should have caught this`);
}

/* ---- engine constants, from the built package ---------------------------- */
const { CHANNEL_PROPS, UNITLESS_CHANNEL_SLUGS } = await import(distUrl("const/channel.js"));
const { STATE_VARIANTS, STATE_STYLE_MAPS } = await import(distUrl("utils/interaction-state.js"));
const { PLACEMENT_PROP_NAMES } = await import(distUrl("utils/placement.js"));
// Not reachable from the entry, so tree-shaken out of dist; read the source.
const [{ PLACEMENT_ADOPTERS }] = await loadTs("utils/placement.ts");
const { PROP_ALIASES, LONG_NAMES } = await import(distUrl("const/prop-aliases.js"));

/* ---- prop groups: the vocabularies the engine actually resolves against -- */
const { boxVariantMap } = await import(distUrl("components/layout/box/box.styles.js"));
const { flexVariantMap, flexItemVariantMap } = await import(
  distUrl("components/layout/flex/flex.style.js"),
);
const { gridVariantMap, gridItemVariantMap } = await import(
  distUrl("components/layout/grid/grid.styles.js"),
);
const { textVariantMap } = await import(distUrl("components/typography/text/text.styles.js"));

/* What kind of CSS value each channel carries — the grammar a validator
   holds an ARBITRARY (non-token) string against. Everything not listed is a
   length-percentage: spacing, sizing, gap, offsets, radius, basis. */
const SLUG_VALUE_TYPES = {
  bg: "color",
  color: "color",
  "border-color": "color",
  shadow: "shadow",
  opacity: "number",
  order: "integer",
};

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
      valueType: SLUG_VALUE_TYPES[slug] ?? "length",
    };
  }
  return { kind: "keyword", tokens, arbitrary: false };
}

/* Long-form spellings (padding, marginTop, width…) are first-class entries:
   validators check their values like any prop, and each side carries a
   marker — `long` on the canonical short form, `short` on the alias — so a
   tool can label with one and emit the other without a table of its own.
   Derived from the same PROP_ALIASES the runtime normalises with. */
const withAliases = (entries) => {
  const out = {};
  for (const [prop, entry] of Object.entries(entries)) {
    const long = LONG_NAMES[prop];
    out[prop] = long ? { ...entry, long } : entry;
  }
  for (const [long, short] of Object.entries(PROP_ALIASES)) {
    if (!out[short]) continue;
    // eslint-disable-next-line no-unused-vars
    const { long: _dropped, ...entry } = out[short];
    out[long] = { ...entry, short };
  }
  return out;
};

const groupSpec = (map) =>
  withAliases(
    Object.fromEntries(Object.entries(map).map(([prop, m]) => [prop, propSpec(prop, m)])),
  );

const box = groupSpec(boxVariantMap);
// The container-establishment prop (`<Box container>`): handled by the
// responsive engine, not the variant maps, so it is added here explicitly.
box.container = { kind: "keyword", tokens: ["true", "false"], arbitrary: false };
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
  placement: withAliases(
    Object.fromEntries(
      PLACEMENT_PROP_NAMES.map((p) => {
        if (!box[p]) fail(`placement prop "${p}" missing from the box group`);
        return [p, box[p]];
      }),
    ),
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

/* Style-prop surfaces per component. Components in neither table get []:
   they take no style-prop group. Their own props are listed under `props`
   (closed vocabularies) and `scalarProps` (booleans, open strings, numbers). */
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


const exportSet = new Set(componentNames);
for (const name of [...Object.keys(PRIMITIVE_GROUPS), ...PLACEMENT_ADOPTERS]) {
  if (!exportSet.has(name)) fail(`authored table names "${name}", which is not exported`);
}

/* The primitive whose own props define each group. */
const GROUP_OWNERS = { box: "Box", flex: "Flex", flexItem: "FlexItem", grid: "Grid", gridItem: "GridItem", stack: "Stack", text: "Text" };

/* Props deliberately typed away on specific components — the validator turns
   these into targeted errors instead of "unknown prop" shrugs. */
const EXCLUDED_PROPS = {
  // `size` is typed `never` — Container has no scale of its own; use maxW.
  Container: ["size"],
  // Presets fix the axis; direction is omitted from their props entirely.
  HStack: ["direction"],
  VStack: ["direction"],
};

/* The shipped client/server boundary, read from the same dist graph the
   server-boundary gate asserts: "none" renders 0 KB of library JS, "leaf" is
   a server shell with a client island inside, "required" hydrates. */
const distGraph = buildGraph(join(PKG, "dist"));
const clientTiers = classifyClient(distGraph, join(PKG, "dist"));

/* Recipe-prop vocabularies (Button variant, Alert status, …), read from the
   rolled-up d.ts — the one place the build states them as closed literal
   unions. See extract-literal-props.mjs for the selection rule. */
const {
  literal: literalProps,
  scalar: scalarProps,
  required: requiredProps,
  propNames,
  redefined,
  needsChildren,
  exports: entryExports,
} = extractComponentTypes(join(PKG, "dist", "index.d.ts"));

/* Category, read off the module that DEFINES each export: the source tree is
   already grouped (components/data-entry/input/...), so the directory is the
   category and nothing has to be listed twice. Consumers that present a
   catalogue — a docs sidebar, a builder's component browser — otherwise each
   invent their own table, and every one of them drifts the day a component
   moves. */
const definingModule = exportsOf(distGraph, join(PKG, "dist"), "index.js");
const categoryOf = (name) => {
  const module = definingModule.get(name);
  const match = module && /(?:^|\/)components\/([^/]+)\//.exec(module);
  return match ? match[1] : undefined;
};

const components = Object.fromEntries(
  componentNames.map((name) => {
    const groups = PRIMITIVE_GROUPS[name] ?? (PLACEMENT_ADOPTERS.includes(name) ? ["placement"] : []);
    const entry = { groups };
    const client = clientTiers.get(name);
    if (client) entry.client = client;
    else fail(`component "${name}" missing from the dist client classification`);
    const category = categoryOf(name);
    if (category) entry.category = category;
    const props = literalProps.get(name);
    if (props) entry.props = props;
    const scalars = scalarProps.get(name);
    if (scalars) entry.scalarProps = scalars;
    // Props the types make mandatory, by the kind of value each takes. A
    // builder fills the string ones and cannot place a component that
    // demands anything else.
    const needed = requiredProps.get(name);
    if (needed) entry.required = needed;
    // Kept out of `required`, which lists the props a builder can fill in:
    // children are composed, not typed into a field.
    if (needsChildren.has(name)) entry.requiresChildren = true;
    // The groups are assigned by table, so reconcile them with the component's
    // real type: a group prop the type omits (Heading's paragraph) is excluded,
    // and one the component redefines (Image's intrinsic width) is its own.
    const groupProps = new Set(groups.flatMap((group) => Object.keys(propGroups[group])));
    const accepted = propNames.get(name);
    const omitted = accepted ? [...groupProps].filter((prop) => !accepted.has(prop)) : [];
    const exclude = [...new Set([...(EXCLUDED_PROPS[name] ?? []), ...omitted])];
    if (exclude.length) entry.exclude = exclude;
    // A group's defining primitive (Box for box) declares that group's props itself.
    const inherited = new Set(
      groups.filter((group) => GROUP_OWNERS[group] !== name).flatMap((group) => Object.keys(propGroups[group])),
    );
    const overrides = (redefined.get(name) ?? []).filter((prop) => inherited.has(prop) && !exclude.includes(prop));
    if (overrides.length) entry.overrides = overrides;
    // Compound parts attached to the export (Menu.Trigger, Card.Body, ...) —
    // enumerated from the real object, so dot-access validates against what
    // actually exists at runtime. Some compounds also have flat exports
    // (CardBody); some are dot-only (MenuItem does not exist) — the parts
    // list is the only truth for dot-access.
    const parts = Object.keys(rootExports[name] ?? {}).filter((k) => /^[A-Z]/.test(k));
    if (parts.length) entry.parts = parts;
    return [name, entry];
  }),
);

/* Flat part exports (CardBody) are the same component as the attached part
   (Card.Body) — proven by IDENTITY, not name-matching, so a coincidental
   name like CheckableTagGroup can never be misclassified. `partOf` lets a
   validator know a flat part's anatomy without seeing the dot. */
for (const [name, entry] of Object.entries(components)) {
  if (!entry.parts) continue;
  for (const part of entry.parts) {
    const flat = name + part;
    if (components[flat] && rootExports[flat] === rootExports[name][part]) {
      components[flat].partOf = name;
    }
  }
}

/* ANATOMY: which attached parts are CHILDREN that need the compound's root
   above them. Authored, because the parts namespace conflates two patterns
   the runtime cannot distinguish: anatomy children (Menu.Item crashes or
   misbehaves without Menu) versus namespaced variants and containers
   (Input.Password is a standalone input; Radio.Group WRAPS radios — the
   direction is inverted). Compounds absent here make no anatomy claim.
   Drift-checked: every name below must exist in the enumerated parts. */
const ANATOMY_CHILDREN = {
  Accordion: ["Item", "Trigger", "Content"],
  AlertDialog: ["Trigger", "Content", "Header", "Body", "Footer", "Title", "Description", "Close"],
  Avatar: ["Badge"],
  Calendar: ["Header", "PrevTrigger", "ViewTrigger", "NextTrigger", "Weekdays", "Grid", "Cell"],
  Collapsible: ["Trigger", "Content"],
  ContextMenu: ["Trigger", "Content", "Item", "Label", "Separator", "Group"],
  Editable: ["Preview", "Input"],
  EmptyState: ["Indicator", "Title", "Description", "Actions"],
  FileUpload: ["Dropzone", "Trigger", "ItemGroup"],
  HoverCard: ["Trigger", "Content"],
  Popout: ["Trigger", "Content"],
  SegmentedControl: ["Item"],
  Splitter: ["Panel", "Handle"],
  Toolbar: ["Group", "Separator"],
  Breadcrumb: ["Item", "Link"],
  Card: ["Header", "Title", "Description", "Body", "Footer"],
  Carousel: ["Track", "Slide", "Control", "Prev", "Next", "Indicators", "Indicator", "AutoPlayTrigger", "ProgressText"],
  CodeBlock: ["Header", "Title", "Content", "Code", "CopyTrigger", "Control", "WindowControls"],
  DataList: ["Item", "Label", "Value"],
  Drawer: ["Trigger", "Content", "Header", "Body", "Footer", "Title", "Description", "Close", "CloseButton"],
  Field: ["Label", "HelpText", "ErrorText"],
  List: ["Item"],
  Marquee: ["Item"],
  Menu: ["Trigger", "Content", "Item", "Label", "Separator", "Group"],
  Modal: ["Trigger", "Content", "Header", "Body", "Footer", "Title", "Description", "Close", "CloseButton"],
  Pagination: ["List", "Item", "First", "Last", "Next", "Prev", "Ellipsis", "Jumper", "PageText", "Pages"],
  Popover: ["Trigger", "Content", "Title", "Description", "Close"],
  Stat: ["Label", "Value", "HelpText", "Indicator"],
  Steps: ["List", "Item", "Indicator", "Title", "Description", "Content", "Next", "Prev", "Completed"],
  Table: ["Header", "Body", "Footer", "Row", "Head", "Cell", "Caption"],
  Tabs: ["List", "Trigger", "Content"],
  Timeline: ["Item", "Indicator", "Title", "Description", "Content"],
  Tooltip: ["Trigger", "Content"],
};

for (const [owner, children] of Object.entries(ANATOMY_CHILDREN)) {
  const entry = components[owner];
  if (!entry?.parts) {
    fail(`anatomy table names "${owner}", which has no enumerated parts`);
    continue;
  }
  for (const child of children) {
    if (!entry.parts.includes(child)) {
      fail(`anatomy: ${owner}.${child} is not an enumerated part of ${owner} (has: ${entry.parts.join(", ")})`);
    }
  }
  entry.anatomy = { children };
}

/* An alias root (AlertDialogRoot, CalendarRoot) carries the very same part
   objects as its canonical name, proven by identity, so it carries the same
   anatomy without a second table entry. */
for (const [name, entry] of Object.entries(components)) {
  if (!entry.parts || entry.anatomy) continue;
  const twin = Object.entries(components).find(
    ([other, candidate]) =>
      other !== name &&
      candidate.anatomy &&
      candidate.anatomy.children.every((part) => rootExports[other][part] === rootExports[name][part]),
  );
  if (twin) entry.anatomy = { children: [...twin[1].anatomy.children] };
}

/* Content and the anatomy gate, both measured by rendering the built
   package. A part that throws on its own belongs in the table above; a part
   listed there that renders fine alone is only a claim about nesting, which
   is still true, so only the first direction is checked. */
const measured = measureContent(rootExports, components);
for (const [name, entry] of Object.entries(components)) {
  const content = measured.content.get(name);
  if (content) entry.content = content;
  const parts = measured.partContent.get(name);
  if (parts) entry.partContent = parts;
  entry.domRoot = measured.domRoot.get(name) === true;
  const partRoots = measured.partDomRoot.get(name);
  if (partRoots) entry.partDomRoot = partRoots;
  const exportsOfParts = measured.partExports.get(name);
  if (exportsOfParts) entry.partExports = exportsOfParts;
  const nesting = measured.within.get(name);
  if (nesting && entry.anatomy) entry.anatomy = { ...entry.anatomy, within: nesting };
  else if (nesting) fail(`anatomy: ${name} has parts that need a sibling part above them but no anatomy entry`);
}
for (const [owner, parts] of measured.needsRoot) {
  const listed = components[owner].anatomy?.children ?? [];
  for (const part of parts) {
    if (!listed.includes(part)) {
      fail(`anatomy: ${owner}.${part} throws when rendered outside <${owner}> but is not listed as its child`);
    }
  }
}

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
  // 2: components carry scalarProps; generatedAt is opt-in.
  // 3: exports lists every name the entry point exports; components carry
  //    overrides and requiresChildren, and exclude covers every group prop
  //    their type omits.
  specVersion: 3,
  // What this version can and cannot answer; consumers should branch on it.
  propsManifest: "style-props-v1",
  // Off by default so two builds of one commit emit identical bytes.
  ...(process.env.ASTRALIS_SPEC_TIMESTAMP ? { generatedAt: new Date().toISOString() } : {}),
  breakpoints,
  containerBreakpoints: CONTAINER_BREAKPOINT_WIDTHS,
  contrast,
  states: STATE_VARIANTS,
  stateableProps: Object.keys(STATE_STYLE_MAPS).sort(),
  channelProps: CHANNEL_PROPS,
  propGroups,
  components,
  exports: entryExports,
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
