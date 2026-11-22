/* ==========================================================================
   ASTRALIS — MERGE CONFIG (shared by gen-merge-config and check-merge-config)
   --------------------------------------------------------------------------
   `astralisMerge` only ever sees `astralis:` classes, and users do not run
   Tailwind, so the only classes that can do anything are the ones compiled
   into dist/styles.css. tailwind-merge's default config describes every
   Tailwind utility with validators and theme scales (~6 kB gzip in the
   browser). This module resolves each stylesheet utility against the FULL
   config once, at build time, and writes the answers down as plain strings:

     - classGroups: every string the merger can look up for a stylesheet
       class (its base utility, and the base without a `/postfix`), listed
       under the group the full config resolves it to. No validators are
       left, so the runtime lookup is an exact trie walk that returns the
       same group the full config returned for every one of those strings.
     - conflictingClassGroups / conflictingClassGroupModifiers /
       postfixLookupClassGroups: the full config's entries for the groups
       that kept at least one class, filtered to kept groups (a dropped group
       is never the group of a stylesheet class, so it cannot be in conflict).
     - orderSensitiveModifiers: the full config's list, filtered to the
       variants the stylesheet actually uses.

   A class outside the stylesheet resolves to no group and passes through
   untouched; it has no CSS, so it does nothing either way.
   ========================================================================== */

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { getDefaultConfig, mergeConfigs } from "tailwind-merge";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PKG = join(__dirname, "..");
export const STYLES = join(PKG, "dist", "styles.css");
export const OUTPUT = join(PKG, "src", "utils", "merge-config.generated.ts");

/* The library names its own scale steps (`duration-fast`, `z-high`) and its
   own keyframe utilities (`animate-fade-up`). The default config knows only
   Tailwind's numbers and names, so it would put these in no group and two of
   them would both stay. The names are read from the files that create the
   utilities, so a step added there is grouped without touching this file. */
const ENTRY_CSS = readFileSync(join(PKG, "src", "tailwind-entry.css"), "utf8");
const MOTION_CSS = readFileSync(join(PKG, "src", "theme", "motion.css"), "utf8");
const themeSteps = (namespace) =>
  [...ENTRY_CSS.matchAll(new RegExp(`^\\s*--${namespace}-([\\w-]+):`, "gm"))].map((m) => m[1]);
const utilitySteps = (root) =>
  [...MOTION_CSS.matchAll(new RegExp(`^@utility ${root}-([\\w-]+)\\s*\\{`, "gm"))].map((m) => m[1]);

export const ASTRALIS_EXTENSION = {
  prefix: "astralis",
  extend: {
    theme: {
      aspect: themeSteps("aspect"),
      animate: utilitySteps("animate"),
    },
    classGroups: {
      duration: [{ duration: themeSteps("transition-duration") }],
      z: [{ z: themeSteps("z-index") }],
      opacity: [{ opacity: themeSteps("opacity") }],
      // Each sets every animation longhand, so a later one replaces an earlier one.
      reveal: [{ reveal: utilitySteps("reveal") }],
      "motion-duration": [{ "motion-duration": utilitySteps("motion-duration") }],
      "motion-delay": [{ "motion-delay": utilitySteps("motion-delay") }],
      "motion-distance": [{ "motion-distance": utilitySteps("motion-distance") }],
      "motion-transition": [{ "motion-transition": utilitySteps("motion-transition") }],
      // `scope` marks the scrolling container, not a mode: an element can be
      // both its own scope and `once`, so it stays out of this group.
      "motion-reveal": [{ "motion-reveal": utilitySteps("motion-reveal").filter((s) => s !== "scope") }],
      // Tell tailwind-merge that 'border-<val>' are valid border widths for these custom keys
      // Text's size="inherit" utility is a font size; unregistered,
      // tailwind-merge would read `text-*` as a colour and drop Link's accent.
      "font-size": [{ text: ["size-inherit"] }],
      "border-w": [{ border: ["normal", "moderate", "thick", "thicker", "thickest"] }],
      // …and the per-side forms, each in its OWN group. Sharing a group with
      // border-w would make `border-b-normal` cancel `border-normal`, when in
      // CSS a one-sided width legitimately overrides only its own side.
      "border-w-t": [{ "border-t": ["normal", "moderate", "thick", "thicker", "thickest"] }],
      "border-w-r": [{ "border-r": ["normal", "moderate", "thick", "thicker", "thickest"] }],
      "border-w-b": [{ "border-b": ["normal", "moderate", "thick", "thicker", "thickest"] }],
      "border-w-l": [{ "border-l": ["normal", "moderate", "thick", "thicker", "thickest"] }],
      // Tell tailwind-merge that 'border-<val>' are valid colors for these custom keys.
      // Only the neutral stroke ladder lives here — a status border is a palette
      // role (`border-error-stroke`), which tailwind-merge already parses.
      "border-color": [{
        border: ["stroke-base", "stroke-muted", "stroke-subtle", "stroke-inverted", "stroke-control"],
      }],
    },
  },
};

/** The config `extendTailwindMerge(ASTRALIS_EXTENSION)` builds: default + ours. */
export const fullConfig = () => mergeConfigs(getDefaultConfig(), ASTRALIS_EXTENSION);

/** Every class selector in the stylesheet, unescaped (the same extraction as
    the coverage gate and the system spec). Includes the unprefixed
    `astralis-*` marker classes, which the merger treats as external. */
export function stylesheetClasses(css = readFileSync(STYLES, "utf8")) {
  const set = new Set();
  for (const m of css.matchAll(/\.((?:[^\s{},.:#()[\]>+~\\'"]|\\.)+)/g)) {
    const name = m[1].replace(/\\(.)/g, "$1");
    if (name.startsWith("astralis")) set.add(name);
  }
  return [...set].sort();
}

/* tailwind-merge does not export its class-map lookup or its class-name
   parser. Bundle them from the package's own TypeScript source so the
   generator resolves classes with the exact code the runtime runs. */
let internals;
export async function twInternals() {
  if (internals) return internals;
  // The package exports no ./package.json; its main entry sits in dist/.
  const root = dirname(dirname(createRequire(import.meta.url).resolve("tailwind-merge")));
  const src = join(root, "src", "lib");
  const dir = mkdtempSync(join(tmpdir(), "astralis-twm-"));
  try {
    const outfile = join(dir, "internals.mjs");
    await build({
      stdin: {
        contents:
          `export { createClassGroupUtils } from ${JSON.stringify(join(src, "class-group-utils.ts"))};\n` +
          `export { createParseClassName } from ${JSON.stringify(join(src, "parse-class-name.ts"))};\n`,
        resolveDir: src,
        loader: "ts",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      logLevel: "error",
    });
    internals = await import(pathToFileURL(outfile).href);
    return internals;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The key getClassGroupId walks for `s`: a leading `-` (negative value) is skipped. */
const lookupKey = (s) => {
  const parts = s.split("-");
  return parts[0] === "" && parts.length > 1 ? parts.slice(1).join("-") : s;
};

/** Resolve the stylesheet's classes against the full config; return the reduced config. */
export async function buildMergeConfig(classes) {
  const { createClassGroupUtils, createParseClassName } = await twInternals();
  const full = fullConfig();
  const parse = createParseClassName(full);
  const { getClassGroupId } = createClassGroupUtils(full);

  const groupOf = new Map(); // lookup key -> group id
  const usedModifiers = new Set();
  const record = (s) => {
    if (s.startsWith("[") && s.endsWith("]")) return; // arbitrary property: resolved without the map
    const key = lookupKey(s);
    if (key === "") return;
    const id = getClassGroupId(s);
    if (id === undefined) return;
    const prev = groupOf.get(key);
    if (prev !== undefined && prev !== id) {
      throw new Error(`merge-config: "${key}" resolves to both ${prev} and ${id}`);
    }
    groupOf.set(key, id);
  };

  for (const cls of classes) {
    const { isExternal, modifiers, baseClassName, maybePostfixModifierPosition } = parse(cls);
    if (isExternal) continue;
    modifiers.forEach((m) => usedModifiers.add(m));
    record(baseClassName);
    if (maybePostfixModifierPosition) record(baseClassName.substring(0, maybePostfixModifierPosition));
  }

  const kept = new Set(groupOf.values());
  const order = Object.keys(full.classGroups).filter((id) => kept.has(id));
  for (const id of kept) if (!order.includes(id)) throw new Error(`merge-config: unknown group ${id}`);

  const byGroup = new Map(order.map((id) => [id, []]));
  for (const [key, id] of groupOf) byGroup.get(id).push(key);
  for (const list of byGroup.values()) list.sort();

  const filterMap = (map) => {
    const out = {};
    for (const id of order) {
      const list = (map[id] ?? []).filter((g) => kept.has(g));
      if (list.length) out[id] = [...new Set(list)];
    }
    return out;
  };

  return {
    cacheSize: full.cacheSize,
    prefix: full.prefix,
    theme: {},
    classGroups: Object.fromEntries(byGroup),
    conflictingClassGroups: filterMap(full.conflictingClassGroups),
    conflictingClassGroupModifiers: filterMap(full.conflictingClassGroupModifiers),
    postfixLookupClassGroups: (full.postfixLookupClassGroups ?? []).filter((g) => kept.has(g)),
    orderSensitiveModifiers: full.orderSensitiveModifiers.filter((m) => usedModifiers.has(m)),
  };
}

/** The `-` segments every class in a sorted group starts with ("" if none). */
const commonPrefix = (list) => {
  const segs = list.map((k) => k.split("-"));
  let n = 0;
  while (segs.every((s) => s.length > n && s[n] === segs[0][n])) n++;
  return segs[0].slice(0, n).join("-");
};

/** The generated module's text. Lists are space-joined strings (class names
    and group ids never contain spaces) and split once when the merger starts.
    A group whose classes share a prefix is written in tailwind-merge's object
    form, `[{ w: ["full", "1/3"] }]`, which builds the same class-map paths as
    the flat names and is a quarter smaller after gzip. The class equal to the
    prefix itself (`rounded`) is the empty string, which sorts first, so its
    list starts with a space. */
export function emitMergeConfig(config) {
  const q = JSON.stringify;
  const lists = (map) =>
    Object.entries(map)
      .map(([id, list]) => `    ${q(id)}: s(${q(list.join(" "))}),`)
      .join("\n");
  const groups = (map) =>
    Object.entries(map)
      .map(([id, list]) => {
        const prefix = commonPrefix(list);
        if (!prefix || list.length === 1) return `    ${q(id)}: s(${q(list.join(" "))}),`;
        const rest = list.map((k) => k.slice(prefix.length + 1));
        return `    ${q(id)}: p(${q(prefix)}, ${q(rest.join(" "))}),`;
      })
      .join("\n");
  return `/* GENERATED by scripts/gen-merge-config.mjs from dist/styles.css - do not edit.
   Run \`pnpm --filter astralis-ui gen:merge-config\` after a build when the
   stylesheet changes; the build's check-merge-config gate fails until you do.
   The library's own additions to tailwind-merge (font-size size-inherit, the
   border width and stroke-colour groups, the named duration, z-index, opacity
   and aspect steps, and the motion utilities) are in scripts/merge-config.mjs. */
import type { Config } from "tailwind-merge";

const s = (list: string): string[] => list.split(" ");
const p = (prefix: string, list: string) => [{ [prefix]: s(list) }];

export const MERGE_CONFIG: Config<string, string> = {
  cacheSize: ${config.cacheSize},
  prefix: ${q(config.prefix)},
  theme: {},
  classGroups: {
${groups(config.classGroups)}
  },
  conflictingClassGroups: {
${lists(config.conflictingClassGroups)}
  },
  conflictingClassGroupModifiers: {
${lists(config.conflictingClassGroupModifiers)}
  },
  postfixLookupClassGroups: ${config.postfixLookupClassGroups.length ? `s(${q(config.postfixLookupClassGroups.join(" "))})` : "[]"},
  orderSensitiveModifiers: ${config.orderSensitiveModifiers.length ? `s(${q(config.orderSensitiveModifiers.join(" "))})` : "[]"},
};
`;
}
