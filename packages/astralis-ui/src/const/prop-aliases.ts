/* ==========================================================================
   ASTRALIS — STYLE PROP ALIASES
   --------------------------------------------------------------------------
   Every abbreviated style prop also answers to its spelt-out CSS name:
   `padding="4"` is `p="4"`, `marginTop="2"` is `mt="2"`. The short forms are
   canonical — classes, channel vars, and the spec key off them — and the
   long forms normalise to them before any resolution happens, so the two can
   never diverge. When both are passed, the short form wins (it is the
   canonical spelling, and a deterministic rule beats an ordering accident).

   The table is THE registry: runtime normalisation, the type surface, and
   the system spec's `long`/`short` markers are all derived from it. Add an
   alias here and every layer learns it; add one anywhere else and it drifts.

   Where a long name collides with a native DOM attribute the component
   actually uses, that component opts out of the alias and keeps the native
   meaning — `Image.width`/`Image.height` are the img element's intrinsic
   size. Form controls whose width/height attributes are dead legacy omit the
   native side instead, so the alias works there.
   ========================================================================== */

/** long name -> canonical short name. */
export const PROP_ALIASES = {
  padding: "p",
  paddingX: "px",
  paddingY: "py",
  paddingTop: "pt",
  paddingRight: "pr",
  paddingBottom: "pb",
  paddingLeft: "pl",
  margin: "m",
  marginX: "mx",
  marginY: "my",
  marginTop: "mt",
  marginRight: "mr",
  marginBottom: "mb",
  marginLeft: "ml",
  width: "w",
  height: "h",
  minWidth: "minW",
  minHeight: "minH",
  maxWidth: "maxW",
  maxHeight: "maxH",
  inlineSize: "inline",
  minInlineSize: "minInline",
  maxInlineSize: "maxInline",
  blockSize: "block",
  minBlockSize: "minBlock",
  maxBlockSize: "maxBlock",
  borderTop: "borderT",
  borderRight: "borderR",
  borderBottom: "borderB",
  borderLeft: "borderL",
  roundedTop: "roundedT",
  roundedRight: "roundedR",
  roundedBottom: "roundedB",
  roundedLeft: "roundedL",
  roundedTopLeft: "roundedTl",
  roundedTopRight: "roundedTr",
  roundedBottomRight: "roundedBr",
  roundedBottomLeft: "roundedBl",
  flexBasis: "basis",
  flexGrow: "grow",
  flexShrink: "shrink",
  columnSpan: "colSpan",
  columnStart: "colStart",
  columnEnd: "colEnd",
  background: "bg",
} as const;

export type AliasName = keyof typeof PROP_ALIASES;

/** short name -> long name, for tools that want the descriptive spelling. */
export const LONG_NAMES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(PROP_ALIASES).map(([long, short]) => [short, long]),
);

const ALIAS_SET = new Set<string>(Object.keys(PROP_ALIASES));

/** Whether a props bag uses any long-form name at all — the fast path. */
export function hasAliases(props: Record<string, unknown>): boolean {
  for (const key in props) {
    if (ALIAS_SET.has(key) && props[key] !== undefined) return true;
  }
  return false;
}

/**
 * The bag with long forms folded onto their short forms. Returns the input
 * object untouched when nothing needs renaming, so the common all-short case
 * costs one scan and no allocation.
 */
export function normalizeAliases<T extends Record<string, unknown>>(
  props: T,
): Record<string, unknown> {
  if (!hasAliases(props)) return props;

  const out: Record<string, unknown> = {};
  for (const key in props) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
    const short = (PROP_ALIASES as Record<string, string | undefined>)[key];
    if (short === undefined) {
      out[key] = props[key];
    } else if (out[short] === undefined && props[short as keyof T] === undefined) {
      out[short] = props[key];
    }
    // else: the short form is (or will be) present and wins; drop the alias.
  }
  return out;
}

/**
 * The alias keys whose short form exists on `P`, each typed as its short
 * form's value — how a component's props gain the long spellings without
 * widening beyond what it actually accepts.
 */
export type AliasesOf<P> = {
  [K in AliasName as (typeof PROP_ALIASES)[K] extends keyof P
    ? K
    : never]?: (typeof PROP_ALIASES)[K] extends keyof P
    ? P[(typeof PROP_ALIASES)[K]]
    : never;
};
