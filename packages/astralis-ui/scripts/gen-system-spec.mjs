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

   A component's style-prop groups are read off its type: one that accepts
   every box prop has `box`, one that accepts every placement prop has
   `placement`. Two lists are still authored and both are drift-checked here:
   PRIMITIVE_GROUPS, for the primitives whose groups prop names alone cannot
   tell apart (Stack and Flex accept the same names), and PLACEMENT_ADOPTERS in
   utils/placement.ts, which placement-props.test.tsx renders. A component
   that accepts a group's props but is not described by it, or a listed
   name that stops existing or stops accepting them, fails this script.

   Prop documentation (propDocs, partPropDocs, and `description` on group
   props) comes from the library's JSDoc and component code: prop-docs.mjs.

   Runs at the end of build:css, after the coverage gate has proven the CSS
   is total, so the spec can only ever describe a verified build.
   ========================================================================== */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { buildGraph, classifyClient, exportsOf } from "./module-graph.mjs";
import { extractComponentTypes, UNDOCUMENTED_PROPS } from "./extract-literal-props.mjs";
import { extractSourceDefaults } from "./prop-docs.mjs";
import { measureContent } from "./measure-content.mjs";
import { loadTs } from "./load-ts.mjs";
import { renderDevStyleProps } from "./dev-style-props.mjs";

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
const { CHANNEL_PROPS, UNITLESS_CHANNEL_SLUGS, channelKeywords } = await import(distUrl("const/channel.js"));
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
  scale: "scale",
  rotate: "angle",
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
      // The CSS-wide keywords this channel honours; any other one would
      // apply to its variable, not the property, and is not emitted.
      cssKeywords: channelKeywords(slug),
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
// Grid's track and area templates: raw CSS, a string or a breakpoint map,
// with no tokens (grid.tsx resolves them, not the variant maps).
const grid = groupSpec(gridVariantMap);
for (const prop of ["templateColumns", "templateRows", "templateAreas"]) {
  grid[prop] = { kind: "raw", tokens: [], arbitrary: true, unitless: false, valueType: "template" };
}
const propGroups = {
  box,
  flex,
  flexItem: groupSpec(flexItemVariantMap),
  grid,
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

/* Groups that cannot be read off the type by prop names: Stack accepts the
   flex names with its own direction vocabulary, and Heading takes the text
   group less `paragraph`. Every other component's groups are derived
   (groupsOf); a derived component that accepts a group these tables do not
   give it fails the build. */
const PRIMITIVE_GROUPS = {
  Flex: ["box", "flex"],
  FlexItem: ["box", "flexItem"],
  Grid: ["box", "grid"],
  GridItem: ["box", "gridItem"],
  Stack: ["box", "stack"],
  HStack: ["box", "stack"],
  VStack: ["box", "stack"],
  Text: ["text", "placement"],
  Heading: ["text", "placement"],
  Link: ["text", "placement"],
};


const exportSet = new Set(componentNames);
for (const name of [...Object.keys(PRIMITIVE_GROUPS), ...PLACEMENT_ADOPTERS]) {
  if (!exportSet.has(name)) fail(`authored table names "${name}", which is not exported`);
}

/* Every style-prop name any group defines. */
const allStyleProps = new Set(Object.values(propGroups).flatMap((group) => Object.keys(group)));

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
  responsive: responsiveProps,
  scalar: scalarProps,
  takesMap,
  required: requiredProps,
  propNames,
  redefined,
  needsChildren,
  ownProps,
  docs: propJsDocs,
  partOwnProps,
  partDocs: partJsDocs,
  inherited: inheritedProps,
  domAttributes,
  exports: entryExports,
} = extractComponentTypes(join(PKG, "dist", "index.d.ts"), {
  responsiveKeys: new Set(["base", ...Object.keys(breakpoints), ...Object.keys(CONTAINER_BREAKPOINT_WIDTHS)]),
});

/* Group membership read off the type: a group is accepted when the type
   takes every one of its props (a prop the component redefines still counts:
   it is listed under `overrides`). Long spellings ride along with the short. */
const shortPropsOf = (group) => Object.keys(propGroups[group]).filter((prop) => !propGroups[group][prop].short);
const acceptsGroup = (name, group) => {
  const accepted = propNames.get(name);
  return accepted !== undefined && shortPropsOf(group).every((prop) => accepted.has(prop));
};
const groupsOf = (name) =>
  PRIMITIVE_GROUPS[name] ?? (acceptsGroup(name, "box") ? ["box"] : acceptsGroup(name, "placement") ? ["placement"] : []);
/** Whether `groups` already describe every prop of `group`. */
const covers = (groups, group) =>
  groups.some((g) => g === group || shortPropsOf(group).every((prop) => prop in propGroups[g]));

for (const name of componentNames) {
  const groups = groupsOf(name);
  for (const group of Object.keys(propGroups)) {
    if (acceptsGroup(name, group) && !covers(groups, group)) {
      fail(`${name} accepts every ${group} prop but its spec groups are [${groups.join(", ")}]: add it to PRIMITIVE_GROUPS`);
    }
  }
}

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

/* Prop documentation. Attached parts with no export of their own (Menu.Item)
   have no entry to carry theirs, so their owner carries it as partPropDocs. */
const dotParts = new Map();
for (const name of componentNames) {
  const root = rootExports[name];
  const parts = Object.keys(root ?? {}).filter(
    (part) => /^[A-Z]/.test(part) && root[part] !== root && !componentNames.some((other) => rootExports[other] === root[part]),
  );
  if (parts.length) dotParts.set(name, parts);
}
const codeDefaults = extractSourceDefaults(join(PKG, "src", "index.ts"), componentNames, dotParts);
const docCoverage = { props: 0, described: 0, defaults: 0 };
const defaultConflicts = [];
/** Coverage counts each component once, not once per alias (TagRoot is Tag). */
const firstOfIdentity = (name) => componentNames.find((other) => rootExports[other] === rootExports[name]) === name;
const unquote = (text) => text.replace(/^["'`](.*)["'`]$/, "$1");

/** A JSDoc default written on another component's props type (MenuProps,
 *  inherited by ContextMenu) describes that component, which `self` may
 *  wrap with a different value. */
const isForeignDefault = (typeName, self) => {
  const base = typeName.replace(/(?:Custom|Base|Own)?Props$/, "");
  return base in rootExports && rootExports[base] !== self;
};

/** JSDoc first; a default only the code states fills in. Only the library's
 *  own props are documented: a DOM attribute the code presets (`role`,
 *  `type="button"`) is plumbing. `skip` is the group props, documented once
 *  on the group instead. */
function docsFor(label, self, { own, jsdoc = {}, defaults = {}, skip, count }) {
  const out = {};
  for (const prop of own) {
    if (skip.has(prop) || UNDOCUMENTED_PROPS.has(prop)) continue;
    const { declaredIn, ...doc } = jsdoc[prop] ?? {};
    if (declaredIn && isForeignDefault(declaredIn, self)) delete doc.default;
    const fromCode = defaults[prop];
    if (fromCode !== undefined && doc.default === undefined) doc.default = fromCode;
    else if (fromCode !== undefined && unquote(doc.default) !== unquote(fromCode)) {
      defaultConflicts.push(`${label}.${prop}: JSDoc says ${doc.default}, the code ${fromCode}`);
    }
    if (count) {
      docCoverage.props += 1;
      if (doc.description) docCoverage.described += 1;
      if (doc.default !== undefined) docCoverage.defaults += 1;
    }
    if (Object.keys(doc).length) out[prop] = doc;
  }
  return out;
}

const components = Object.fromEntries(
  componentNames.map((name) => {
    const groups = groupsOf(name);
    const entry = { groups };
    const client = clientTiers.get(name);
    if (client) entry.client = client;
    else fail(`component "${name}" missing from the dist client classification`);
    const category = categoryOf(name);
    if (category) entry.category = category;
    const groupProps = new Set(groups.flatMap((group) => Object.keys(propGroups[group])));
    // A responsive vocabulary outside the groups is the component's own
    // (List styleType, Separator orientation); inside them, the group's.
    const ownResponsive = Object.entries(responsiveProps.get(name) ?? {}).filter(([prop]) => !groupProps.has(prop));
    const props = { ...literalProps.get(name), ...Object.fromEntries(ownResponsive) };
    if (Object.keys(props).length) entry.props = props;
    // A responsive scalar inside the groups (Box's p) is the group's prop.
    const mapProps = [...(takesMap.get(name) ?? [])].filter((prop) => !groupProps.has(prop));
    const scalars = Object.fromEntries(
      Object.entries(scalarProps.get(name) ?? {}).filter(([prop]) => !groupProps.has(prop) || !takesMap.get(name)?.has(prop)),
    );
    if (Object.keys(scalars).length) entry.scalarProps = scalars;
    // Own props that also take a responsive map ({ base, md }) of their values:
    // List styleType, Carousel slidesPerView, Icon size.
    if (mapProps.length) entry.responsiveProps = mapProps.sort();
    // Props the types make mandatory, by the kind of value each takes. A
    // builder fills the string ones and cannot place a component that
    // demands anything else.
    const needed = requiredProps.get(name);
    if (needed) entry.required = needed;
    // Kept out of `required`, which lists the props a builder can fill in:
    // children are composed, not typed into a field.
    if (needsChildren.has(name)) entry.requiresChildren = true;
    // Reconcile the groups with the component's real type: a group prop the
    // type omits (Heading's paragraph) is excluded, and one the component
    // redefines (Image's intrinsic width) is its own.
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
    // Style-prop names the component's own type declares outside its groups
    // (Image's aspectRatio, Marquee's gap): with this list the validator can
    // tell a style prop the component ignores from one it takes as its own.
    // Present, possibly empty, whenever the type was read. A name the type
    // takes only as an attribute of the element (Textarea's rows, Table.Cell's
    // colSpan, Icon's svg opacity) is not the component's own: it is listed
    // apart, so the validator still knows it is no stray.
    if (accepted) {
      const outside = [...accepted].filter((prop) => allStyleProps.has(prop) && !groupProps.has(prop)).sort();
      entry.ownStyleProps = outside.filter((prop) => !inheritedProps.get(name)?.has(prop));
      const domStyleProps = outside.filter((prop) => domAttributes.get(name)?.has(prop));
      if (domStyleProps.length) entry.domStyleProps = domStyleProps;
    }
    // Compound parts attached to the export (Menu.Trigger, Card.Body, ...) —
    // enumerated from the real object, so dot-access validates against what
    // actually exists at runtime. Some compounds also have flat exports
    // (CardBody); some are dot-only (MenuItem does not exist) — the parts
    // list is the only truth for dot-access.
    const parts = Object.keys(rootExports[name] ?? {}).filter((k) => /^[A-Z]/.test(k));
    if (parts.length) entry.parts = parts;
    const skip = new Set([...groupProps].filter((prop) => !overrides.includes(prop)));
    const propDocs = docsFor(name, rootExports[name], {
      own: ownProps.get(name) ?? [],
      jsdoc: propJsDocs.get(name),
      defaults: codeDefaults.components.get(name),
      skip,
      count: firstOfIdentity(name),
    });
    if (Object.keys(propDocs).length) entry.propDocs = propDocs;
    const partPropDocs = {};
    for (const part of dotParts.get(name) ?? []) {
      const docs = docsFor(`${name}.${part}`, rootExports[name][part], {
        own: partOwnProps.get(name)?.[part] ?? [],
        jsdoc: partJsDocs.get(name)?.[part],
        defaults: codeDefaults.parts.get(name)?.[part],
        skip: new Set(),
        count: firstOfIdentity(name),
      });
      if (Object.keys(docs).length) partPropDocs[part] = docs;
    }
    if (Object.keys(partPropDocs).length) entry.partPropDocs = partPropDocs;
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

/* PLACEMENT_ADOPTERS is what placement-props.test.tsx renders, so it must
   name every component the types give placement props, and only those. An
   alias of a listed component (TagRoot is Tag) is the same function; a part
   (Input.Password) is described by its own groups but is not on the list,
   which names compounds and standalone components. */
const adopters = new Set(PLACEMENT_ADOPTERS);
for (const [name, entry] of Object.entries(components)) {
  const takesPlacement = entry.groups.includes("placement");
  const listedAs = [...adopters].find((listed) => rootExports[listed] === rootExports[name]);
  if (adopters.has(name) && !takesPlacement) {
    fail(`PLACEMENT_ADOPTERS names "${name}", whose type does not take every placement prop`);
  } else if (takesPlacement && !listedAs && !entry.partOf) {
    fail(`"${name}" takes placement props but is missing from PLACEMENT_ADOPTERS (utils/placement.ts) and its test`);
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

/* Style props are documented once, on their group, from the JSDoc of the
   primitive that defines the group (placement is Box's subset). A long
   spelling shares its short form's description. */
for (const [group, props] of Object.entries(propGroups)) {
  const owner = GROUP_OWNERS[group] ?? (group === "placement" ? "Box" : null);
  const ownerDocs = owner ? propJsDocs.get(owner) ?? {} : {};
  for (const [prop, spec] of Object.entries(props)) {
    const description = ownerDocs[spec.short ?? prop]?.description;
    if (description) props[prop] = { ...spec, description };
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
  // 4: channel props carry cssKeywords; components carry responsiveProps; scalarProps and props describe the
  //    props that take a number or tokens, and a responsive map of them.
  specVersion: 4,
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

/* The development warning's copy of the style-prop judgement (dev-style-props.mjs). */
const devTable = renderDevStyleProps(spec, rootExports);
const devTablePath = join(PKG, "src", "utils", "dev-style-props.ts");
const devTableNow = (() => {
  try {
    return readFileSync(devTablePath, "utf8").replace(/\r\n/g, "\n");
  } catch {
    return null;
  }
})();
if (process.argv.includes("--write-dev-props")) {
  writeFileSync(devTablePath, devTable.source);
  console.log(`[astralis] wrote ${devTablePath}; build again so dist carries it`);
} else if (devTable.problems.length || devTableNow !== devTable.source) {
  console.error("[astralis] SYSTEM SPEC FAILURE:");
  for (const problem of devTable.problems) console.error("  " + problem);
  if (devTableNow !== devTable.source) {
    console.error("  src/utils/dev-style-props.ts no longer matches the spec: run `pnpm run gen:dev-props`, then build again");
  }
  process.exit(1);
}

const out = join(PKG, "dist", "system-spec.json");
writeFileSync(out, JSON.stringify(spec, null, 2) + "\n");

const tokenCount = Object.values(propGroups)
  .flatMap((g) => Object.values(g))
  .reduce((n, p) => n + p.tokens.length, 0);
console.log(
  `[astralis] system spec: ${componentNames.length} components | ` +
    `${Object.keys(propGroups).length} prop groups, ${tokenCount} tokens | ` +
    `${classes.length} classes | ${cssVariables.length} variables | ` +
    `${docCoverage.described}/${docCoverage.props} own props described, ${docCoverage.defaults} with a default ` +
    `-> dist/system-spec.json`,
);
for (const conflict of new Set(defaultConflicts)) console.warn(`[astralis] prop default disagrees: ${conflict}`);
