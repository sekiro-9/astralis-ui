/* ==========================================================================
   ASTRALIS INTERACTION-STATE ENGINE
   --------------------------------------------------------------------------
   The sibling of the responsive engine, on the same var-channel:

     <Flex hover={{ bg: "subtle" }} />
       -> class: astralis-hover-bg
          style: --astralis-bg-hover: var(--astralis-color-surface-subtle)

   The state class (theme/channels.css) applies the property under the pseudo
   (`.astralis-hover-bg:hover { background-color: var(--astralis-bg-hover) }`)
   and the custom property carries the value.

   SCOPE: every channel prop. The old 5-paint-prop limit existed only because
   enumerated state classes were measured at +45.9 KB brotli / +33 s per CSS
   build for the full token surface — a var-read rule per prop per state costs
   nothing, so the limit is gone. States still do NOT compose with breakpoints
   (no `hover: { md: ... }`): one var per state.

   The type is the contract: a state may only carry channel props, with the
   same token vocabulary as the base prop.

   NO `disabled` STATE, on purpose. `disabled` is a real HTML attribute — a
   `<Box as="button" disabled>` must keep working — and CSS `:disabled` only
   matches form controls, which are exactly the components that already own
   their disabled styling. A `disabled` style prop would collide with the
   attribute and do nothing on the elements you'd hand-compose.
   ========================================================================== */

import { boxVariantMap } from "../components/layout/box/box.styles";
import { gapTypes, rowGapTypes, columnGapTypes } from "../const/layout-mappings";
import { CHANNEL_PROPS, channelVar, isChannelMap } from "../const/channel";

/** State prop name -> the CSS variant it compiles to. */
export const STATE_VARIANTS = {
  hover: "hover",
  focusVisible: "focus-visible",
  active: "active",
} as const;

export type StatePropName = keyof typeof STATE_VARIANTS;

export const STATE_PROP_NAMES = Object.keys(STATE_VARIANTS) as StatePropName[];

const STATE_PROP_SET = new Set<string>(STATE_PROP_NAMES);

/** True when a prop key is an interaction-state object rather than a style prop. */
export const isStateProp = (key: string): key is StatePropName => STATE_PROP_SET.has(key);

/* Everything stateable: Box's channel props plus the gap family (Flex/Grid).
   Derived, not hand-listed, so it can't drift from the base vocabulary. */
const STATE_SOURCE = {
  ...boxVariantMap,
  gap: gapTypes,
  rowGap: rowGapTypes,
  columnGap: columnGapTypes,
} as const;

type StateableKey = Extract<keyof typeof STATE_SOURCE, keyof typeof CHANNEL_PROPS>;

/** The style props a state may carry — every channel prop, same tokens as base. */
export const STATE_STYLE_MAPS = Object.fromEntries(
  Object.entries(STATE_SOURCE).filter(
    ([key, map]) => key in CHANNEL_PROPS && isChannelMap(map as Record<string, string>),
  ),
) as Record<string, Record<string, string>>;

/** What one state object may carry. */
export type StateStyles = {
  [K in StateableKey]?: keyof (typeof STATE_SOURCE)[K];
};

/** `hover` / `focusVisible` / `active`, each taking a state object. */
export type StateProps = { [K in StatePropName]?: StateStyles };

/** What one state object resolves to: the state classes plus their vars. */
export interface ResolvedStateStyles {
  className: string;
  style: Record<string, string>;
}

/**
 * Resolves ONE state object, e.g. `("hover", { bg: "subtle", p: "6" })` ->
 * classes `astralis-hover-bg astralis-hover-p` + vars
 * `--astralis-bg-hover` / `--astralis-p-hover`.
 *
 * Values come from the same token maps the base props use, so a state can
 * never paint a value the base layer could not. Token lookups use
 * `=== undefined` — "0" is a real token.
 */
export function resolveStateStyles(state: StatePropName, styles: unknown): ResolvedStateStyles {
  const out: ResolvedStateStyles = { className: "", style: {} };
  if (!styles || typeof styles !== "object") return out;

  const variant = STATE_VARIANTS[state];
  const classes: string[] = [];

  for (const prop in styles as Record<string, string>) {
    const map = STATE_STYLE_MAPS[prop];
    if (!map) continue;
    const css = map[(styles as Record<string, string>)[prop]];
    if (css === undefined) continue;
    const slug = (CHANNEL_PROPS as Record<string, string>)[prop];
    classes.push(`astralis-${variant}-${slug}`);
    out.style[channelVar(slug, variant)] = css;
  }

  out.className = classes.join(" ");
  return out;
}
