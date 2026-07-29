/* ==========================================================================
   ASTRALIS INTERACTION-STATE ENGINE
   --------------------------------------------------------------------------
   The sibling of the responsive engine. Where that one prefixes a token class
   with a breakpoint, this one prefixes it with an interaction state:

     <Flex hover={{ bg: "subtle" }} />   ->  astralis:hover:bg-surface-subtle

   Both are the same string surgery — insert a variant immediately after the
   `astralis:` prefix — so `withVariant` is shared between them.

   WHY THE SCOPE IS NARROWER THAN THE RESPONSIVE LAYER
   The library ships precompiled CSS, so every state class must be generated at
   build time. Measured: granting states to all ~3,000 style-prop tokens costs
   +45.9 KB brotli and +33s on every CSS build, and what it buys is
   `hover:padding` — layout shifting under the cursor. Restricting states to the
   properties that PAINT costs +9.5 KB and covers every interaction pattern the
   blocks needed.

   The type is the contract: if a key is accepted, its CSS exists. There is
   deliberately no way to express a state style that was never generated.

   NO `disabled` STATE, on purpose. `disabled` is a real HTML attribute — a
   `<Box as="button" disabled>` must keep working — and CSS `:disabled` only
   matches form controls, which are exactly the components that already own
   their disabled styling. A `disabled` style prop would collide with the
   attribute and do nothing on the elements you'd hand-compose.
   ========================================================================== */

import { bgColors, textColors, borderColors } from "../const/color-mappings";
import { shadowTypes, opacityTypes } from "../const/common-mappings";

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

/**
 * The style props a state may paint. Narrower than boxVariantMap by design —
 * see the scope note above. Keep in step with STATE_SOURCE_MAPS in
 * scripts/token-scope.mjs; the CSS coverage gate fails loudly if they drift.
 */
export const STATE_STYLE_MAPS = {
  bg: bgColors,
  color: textColors,
  borderColor: borderColors,
  shadow: shadowTypes,
  opacity: opacityTypes,
} as const;

/** What one state object may carry. */
export type StateStyles = {
  [K in keyof typeof STATE_STYLE_MAPS]?: keyof (typeof STATE_STYLE_MAPS)[K];
};

/** `hover` / `focusVisible` / `active`, each taking a state object. */
export type StateProps = { [K in StatePropName]?: StateStyles };

/**
 * Injects a variant *inside* the astralis prefix so the result is a valid
 * Tailwind-v4 prefixed class: "astralis:bg-x" + "hover" -> "astralis:hover:bg-x".
 * Shared with the responsive engine, which passes a breakpoint instead.
 */
export function withVariant(className: string, variant: string): string {
  return className
    .split(" ")
    .filter(Boolean)
    .map((token) => {
      const colon = token.indexOf(":");
      if (colon === -1) return `${variant}:${token}`;
      return `${token.slice(0, colon + 1)}${variant}:${token.slice(colon + 1)}`;
    })
    .join(" ");
}

/**
 * Resolves ONE state object into classes, e.g.
 * `("hover", { bg: "subtle" })` -> `"astralis:hover:bg-surface-subtle"`.
 *
 * Values come from the same token maps the base props use, so a state can never
 * paint a colour the base layer could not.
 */
export function resolveStateStyles(state: StatePropName, styles: unknown): string {
  if (!styles || typeof styles !== "object") return "";

  const variant = STATE_VARIANTS[state];
  const out: string[] = [];

  for (const prop in styles as Record<string, string>) {
    const map = (STATE_STYLE_MAPS as Record<string, Record<string, string>>)[prop];
    if (!map) continue;
    const cls = map[(styles as Record<string, string>)[prop]];
    if (!cls) continue;
    out.push(withVariant(cls, variant));
  }

  return out.join(" ");
}
