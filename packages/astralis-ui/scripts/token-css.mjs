/* ==========================================================================
   ASTRALIS — GENERATED TOKEN CSS
   --------------------------------------------------------------------------
   Pure emitters for every stylesheet derived from a TypeScript table:

     src/theme/tokens/semantic.css     <- theme/token-spec.ts (roles per mode)
     src/theme/tokens/accent.css       <- theme/token-spec.ts (HUES x ROLES)
     src/theme/tokens/breakpoints.css  <- const/breakpoints.ts
     src/theme/channels.css            <- const/channel.ts + const/breakpoints.ts

   scripts/gen-tokens.mjs writes them; scripts/check-token-sync.mjs (part of
   build:css) fails when a committed copy differs from what these return.
   ========================================================================== */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadTs, SRC } from "./load-ts.mjs";

const THEME = join(SRC, "theme");

export const OUTPUTS = {
  semantic: join(THEME, "tokens", "semantic.css"),
  accent: join(THEME, "tokens", "accent.css"),
  breakpoints: join(THEME, "tokens", "breakpoints.css"),
  channels: join(THEME, "channels.css"),
};

/** token-spec plus the contrast rule "auto" resolves through. */
export async function loadSpec() {
  const [spec, math] = await loadTs("theme/token-spec.ts", "theme/theme-math.ts");
  return { ...spec, contrastOn: math.contrastOn };
}

/** CHANNEL_PROPS, the slugs with an `inherit` class, and the breakpoint table. */
export async function loadLayout() {
  const [channel, breakpoints] = await loadTs("const/channel.ts", "const/breakpoints.ts");
  return {
    CHANNEL_PROPS: channel.CHANNEL_PROPS,
    INHERIT_CHANNEL_SLUGS: channel.INHERIT_CHANNEL_SLUGS,
    ...breakpoints,
  };
}

/**
 * The shipped primitive palette, parsed out of tokens/color.css so "auto"
 * resolves against the colors that actually ship. Follows var() indirection —
 * brand-500 aliases yellow-500 by default.
 */
export function loadPalette() {
  const css = readFileSync(join(THEME, "tokens", "color.css"), "utf8");
  const raw = {};
  for (const m of css.matchAll(/--astralis-color-([a-z0-9-]+):\s*([^;]+);/g)) {
    raw[m[1]] = m[2].trim();
  }
  const resolve = (v, depth = 0) => {
    const alias = /^var\(--astralis-color-([a-z0-9-]+)\)$/.exec(v);
    if (!alias || depth > 4) return v;
    return resolve(raw[alias[1]] ?? v, depth + 1);
  };
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v)]));
}

const banner = (title, source, lines = []) =>
  [
    "/* ==========================================================================",
    "   AUTO-GENERATED — DO NOT EDIT BY HAND",
    `   Source: scripts/gen-tokens.mjs  <-  ${source}`,
    "",
    `   ${title}`,
    ...lines.map((l) => (l ? `   ${l}` : "")),
    "   ========================================================================== */",
    "",
  ].join("\n");

/* ---- semantic.css ------------------------------------------------------- */

const PAD = 36; // aligns the value column

const decl = (name, ref) =>
  `  ${`--astralis-color-${name}:`.padEnd(PAD)} var(--astralis-color-${ref});`;

function semanticBlock(spec, palette, mode) {
  const { HUES, ROLES, GLOBAL_SEMANTICS, roleTargets, roleRef, contrastOn } = spec;
  const i = mode === "light" ? 0 : 1;

  // Bake "auto" to a flat white/black against the hue's solid as it ships;
  // at runtime the provider recomputes it against the seeded colour.
  const bake = (hue, targets, role) => {
    const target = targets[role];
    if (target !== "auto") return target;
    // targets is this mode's recipe, so targets.solid is the right step
    // (warning's solid is 600 in light but 500 in dark).
    const solid = palette[roleRef(hue, targets.solid)] ?? "#000000";
    return contrastOn(solid) === "#000000" ? "black" : "white";
  };
  const lines = [];

  const group = (label, prefix) => {
    lines.push(`  /* ---- GLOBAL: ${label} ---- */`);
    for (const [name, refs] of Object.entries(GLOBAL_SEMANTICS)) {
      if (name.startsWith(prefix)) lines.push(decl(name, refs[i]));
    }
    lines.push("");
  };

  group("Surfaces (Backgrounds)", "surface-");
  group("Labels (Text / Foreground)", "label-");
  group("Strokes (Borders)", "stroke-");

  lines.push(`  /* ---- PER-PALETTE ROLES (${mode}) ---- */`);
  for (const hue of HUES) {
    const targets = roleTargets(hue, mode);
    for (const role of ROLES) lines.push(decl(`${hue}-${role}`, roleRef(hue, bake(hue, targets, role))));
    lines.push("");
  }
  while (lines.at(-1) === "") lines.pop();
  return lines.join("\n");
}

export function semanticCss(spec, palette) {
  return [
    banner("ASTRALIS SEMANTIC DESIGN TOKENS", "src/theme/token-spec.ts", [
      "Two tiers:",
      "1. GLOBAL semantics — neutral roles (surface / label / stroke), no hue.",
      "2. PER-PALETTE roles — every hue gets the same role vocabulary",
      "   (solid, contrast, label, subtle, muted, stroke, ring),",
      "   each with a light + dark value.",
      "",
      "To change a formula, edit token-spec.ts and regenerate — editing this",
      "file directly desyncs it from the provider's runtime overrides.",
    ]),
    ":root {",
    semanticBlock(spec, palette, "light"),
    "}",
    "",
    "/* ============================================",
    "   DARK MODE",
    "   ============================================ */",
    ".astralis-dark {",
    semanticBlock(spec, palette, "dark"),
    "}",
    "",
  ].join("\n");
}

/* ---- accent.css --------------------------------------------------------- */

export function accentCss(spec) {
  const { HUES, ROLES } = spec;
  const bind = (hue) =>
    ROLES.map((role) => `  --astralis-color-accent-${role}: var(--astralis-color-${hue}-${role});`);
  return [
    banner("ACCENT CHANNEL", "src/theme/token-spec.ts (HUES x ROLES)", [
      "A virtual palette any component paints with via `accent-*` utilities",
      "(bg-accent-solid, text-accent-contrast, outline-accent-ring).",
      "It defaults to brand; a `.astralis-accent-{hue}` scope class rebinds it",
      "to a real hue for its subtree. Each rebind points at the hue's own role",
      "tokens, which are already light/dark-aware. This is how `colorScheme`",
      "works: add a hue to HUES and every accent-painting component takes it.",
    ]),
    ":root {",
    ...bind("brand"),
    "}",
    ...HUES.flatMap((hue) => ["", `.astralis-accent-${hue} {`, ...bind(hue), "}"]),
    "",
  ].join("\n");
}

/* ---- breakpoints.css ---------------------------------------------------- */

export function breakpointsCss({ BREAKPOINTS, BREAKPOINT_WIDTHS }) {
  return [
    banner("BREAKPOINTS", "src/const/breakpoints.ts", [
      "--breakpoint-* drives Tailwind's sm..xl variants; the --astralis-breakpoint-*",
      "copies are for scripts that read the widths at runtime (matchMedia).",
    ]),
    "@theme inline reference {",
    ...BREAKPOINTS.map((bp) => `  --breakpoint-${bp}: ${BREAKPOINT_WIDTHS[bp]};`),
    "}",
    "",
    ":root {",
    ...BREAKPOINTS.map((bp) => `  --astralis-breakpoint-${bp}: ${BREAKPOINT_WIDTHS[bp]};`),
    "}",
    "",
  ].join("\n");
}

/* ---- channels.css ------------------------------------------------------- */

/** A declaration written as is, rather than as `property: var(slug var)`. */
const TRANSLATE_PAIR = "translate: var(--tw-translate-x) var(--tw-translate-y)";

/* Non-inheriting, starting at 0: a child's translateY must not pick up its
   parent's x. Tailwind registers the same two when a translate utility is
   used; this keeps the props working when none is. */
const TRANSLATE_PROPERTIES = ["--tw-translate-x", "--tw-translate-y"].map(
  (name) => `@property ${name} { syntax: "*"; inherits: false; initial-value: 0; }`,
);

/**
 * The CSS each channel slug writes, in cascade order: within a group the
 * shorthand comes first so a longhand set on the same element wins.
 */
const CHANNEL_GROUPS = [
  ["padding", {
    p: ["padding"], py: ["padding-block"], px: ["padding-inline"],
    pt: ["padding-top"], pr: ["padding-right"], pb: ["padding-bottom"], pl: ["padding-left"],
  }],
  ["margin", {
    m: ["margin"], my: ["margin-block"], mx: ["margin-inline"],
    mt: ["margin-top"], mr: ["margin-right"], mb: ["margin-bottom"], ml: ["margin-left"],
  }],
  ["sizing (size first: shorthand for both axes; logical after physical so it wins when both are set)", {
    size: ["width", "height"],
    w: ["width"], "min-w": ["min-width"], "max-w": ["max-width"],
    h: ["height"], "min-h": ["min-height"], "max-h": ["max-height"],
    inline: ["inline-size"], "min-inline": ["min-inline-size"], "max-inline": ["max-inline-size"],
    block: ["block-size"], "min-block": ["min-block-size"], "max-block": ["max-block-size"],
  }],
  ["gap", { gap: ["gap"], "row-gap": ["row-gap"], "column-gap": ["column-gap"] }],
  ["position offsets (inset first: shorthand)", {
    inset: ["inset"], top: ["top"], right: ["right"], bottom: ["bottom"], left: ["left"],
  }],
  ["radius (shorthand, then edges, then corners)", {
    rounded: ["border-radius"],
    "rounded-t": ["border-top-left-radius", "border-top-right-radius"],
    "rounded-r": ["border-top-right-radius", "border-bottom-right-radius"],
    "rounded-b": ["border-bottom-right-radius", "border-bottom-left-radius"],
    "rounded-l": ["border-top-left-radius", "border-bottom-left-radius"],
    "rounded-tl": ["border-top-left-radius"],
    "rounded-tr": ["border-top-right-radius"],
    "rounded-br": ["border-bottom-right-radius"],
    "rounded-bl": ["border-bottom-left-radius"],
  }],
  ["flex item", { basis: ["flex-basis"], order: ["order"] }],
  ["paint", {
    bg: ["background-color"], color: ["color"], "border-color": ["border-color"],
    shadow: ["box-shadow"], opacity: ["opacity"],
  }],
  // One `translate` takes both axes, so each axis sets its own variable and
  // writes the pair. They are Tailwind's variables, so an axis the prop does
  // not set keeps a translate utility's value (Float's centring).
  ["transform (the individual properties, which compose with each other and with `transform`)", {
    scale: ["scale"],
    "translate-x": ["--tw-translate-x", TRANSLATE_PAIR],
    "translate-y": ["--tw-translate-y", TRANSLATE_PAIR],
    rotate: ["rotate"],
  }],
];

const STATES = ["hover", "focus-visible", "active"];

/** Throws unless CHANNEL_GROUPS covers exactly the slugs in CHANNEL_PROPS. */
function channelSlugs(CHANNEL_PROPS) {
  const declared = CHANNEL_GROUPS.flatMap(([, slugs]) => Object.keys(slugs));
  const wanted = new Set(Object.values(CHANNEL_PROPS));
  const missing = [...wanted].filter((s) => !declared.includes(s));
  const extra = declared.filter((s) => !wanted.has(s));
  if (missing.length || extra.length) {
    throw new Error(
      `[astralis] channel CSS table out of step with CHANNEL_PROPS — ` +
        `add to CHANNEL_GROUPS in scripts/token-css.mjs: [${missing}]; remove: [${extra}]`,
    );
  }
}

export function channelsCss({ CHANNEL_PROPS, INHERIT_CHANNEL_SLUGS, BREAKPOINTS, BREAKPOINT_WIDTHS }) {
  channelSlugs(CHANNEL_PROPS);
  const all = CHANNEL_GROUPS.flatMap(([, slugs]) => Object.entries(slugs));
  const declare = (props, value) => props.map((p) => (p.includes(":") ? `${p};` : `${p}: ${value};`)).join(" ");
  // A slug's `inherit` rule follows its var rule in the same block, so it
  // takes part in the same breakpoint and state order.
  const rules = (indent, slug, props, { selector, v, inherit }) => [
    `${indent}${selector} { ${declare(props, `var(${v})`)} }`,
    ...(INHERIT_CHANNEL_SLUGS.has(slug) ? [`${indent}${inherit} { ${declare(props, "inherit")} }`] : []),
  ];

  const lines = [
    banner("VAR-CHANNEL RULES", "src/const/channel.ts + src/const/breakpoints.ts", [
      "One rule per value-bearing prop per breakpoint, reading a custom property",
      "the responsive engine sets on the element's style attribute. The class says",
      "WHERE the value lands; the variable says WHAT it is.",
      "",
      "- Layer `channels` sits ABOVE `utilities`, so an explicit per-element prop",
      "  beats a recipe's ambient utility class (Table's wrapper w-full,",
      "  Separator's h-full). Inline `style` still beats everything.",
      "- Within each block, shorthand before longhand (p before px/py before",
      "  pt/...), so at equal specificity the longhand wins.",
      "- Media and container blocks are additive; the later block wins, which",
      "  gives replace semantics per breakpoint with no counter-classes.",
      "- States follow the breakpoint blocks, so an active state beats a",
      "  breakpoint value. States do not compose with breakpoints.",
      "- Custom properties inherit, but a child only carries the channel class",
      "  when it received the prop itself, so inherited values are inert.",
      "- `inherit` on bg, color, borderColor and rounded has a rule of its own",
      "  (.astralis-color-inherit): a variable set to `inherit` inherits the variable.",
    ]),
    ...TRANSLATE_PROPERTIES,
    "",
    "@layer channels {",
  ];

  for (const [label, slugs] of CHANNEL_GROUPS) {
    lines.push(`  /* --- ${label} --- */`);
    for (const [slug, props] of Object.entries(slugs)) {
      lines.push(...rules("  ", slug, props, {
        selector: `.astralis-${slug}`, v: `--astralis-${slug}`, inherit: `.astralis-${slug}-inherit`,
      }));
    }
    lines.push("");
  }

  for (const bp of BREAKPOINTS) {
    const width = BREAKPOINT_WIDTHS[bp];
    lines.push(`  /* ===== ${bp} (${width}) ===== */`, `  @media (min-width: ${width}) {`);
    for (const [slug, props] of all) {
      lines.push(...rules("    ", slug, props, {
        selector: `.astralis-${slug}-${bp}`, v: `--astralis-${slug}-${bp}`, inherit: `.astralis-${slug}-inherit-${bp}`,
      }));
    }
    lines.push("  }", "");
  }

  lines.push(
    "  /* Container keys (@sm..@xl): the same widths, resolved against the nearest",
    "     `container` ancestor. inline-size, not size: height containment would",
    "     collapse normal-flow children. */",
    "  .astralis-container { container-type: inline-size; }",
  );
  for (const bp of BREAKPOINTS) {
    const width = BREAKPOINT_WIDTHS[bp];
    lines.push(`  /* ===== @${bp} (${width}) ===== */`, `  @container (min-width: ${width}) {`);
    for (const [slug, props] of all) {
      lines.push(...rules("    ", slug, props, {
        selector: `.astralis-${slug}-cq-${bp}`, v: `--astralis-${slug}-cq-${bp}`, inherit: `.astralis-${slug}-inherit-cq-${bp}`,
      }));
    }
    lines.push("  }", "");
  }

  for (const state of STATES) {
    lines.push(`  /* ===== state: ${state} ===== */`);
    for (const [slug, props] of all) {
      lines.push(...rules("  ", slug, props, {
        selector: `.astralis-${state}-${slug}:${state}`,
        v: `--astralis-${slug}-${state}`,
        inherit: `.astralis-${state}-${slug}-inherit:${state}`,
      }));
    }
    lines.push("");
  }
  while (lines.at(-1) === "") lines.pop();
  lines.push("}", "");
  return lines.join("\n");
}
