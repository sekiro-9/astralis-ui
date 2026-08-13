/* ==========================================================================
   ASTRALIS — VAR-CHANNEL REGISTRY
   --------------------------------------------------------------------------
   Value-bearing style props don't enumerate a class per token. Each prop owns
   ONE hand-authored rule per breakpoint in theme/channels.css that reads a
   custom property, and the value rides the element's style attribute:

     <Box p={{ base: "2", md: "4" }} />
       -> class="astralis-p astralis-p-md"
          style="--astralis-p: var(--astralis-spacing-2);
                 --astralis-p-md: var(--astralis-spacing-4)"

   This map is the single source of truth for WHICH props are channel props
   and the slug their class/var names derive from. The responsive engine
   branches on it, the coverage gate asserts channels.css defines every slug
   at base + all four breakpoints, and tests import it to build assertions.

   Keyword props (display, position, alignment, ...) are closed sets and stay
   enumerated Tailwind classes — do not add them here.
   ========================================================================== */

export const CHANNEL_PROPS = {
  // Padding
  p: "p",
  py: "py",
  px: "px",
  pt: "pt",
  pr: "pr",
  pb: "pb",
  pl: "pl",
  // Margin
  m: "m",
  my: "my",
  mx: "mx",
  mt: "mt",
  mr: "mr",
  mb: "mb",
  ml: "ml",
  // Sizing — physical
  w: "w",
  minW: "min-w",
  maxW: "max-w",
  h: "h",
  minH: "min-h",
  maxH: "max-h",
  size: "size",
  // Sizing — logical (writing-mode aware)
  inline: "inline",
  minInline: "min-inline",
  maxInline: "max-inline",
  block: "block",
  minBlock: "min-block",
  maxBlock: "max-block",
  // Gap
  gap: "gap",
  rowGap: "row-gap",
  columnGap: "column-gap",
  // Position offsets
  inset: "inset",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  // Radius
  rounded: "rounded",
  roundedT: "rounded-t",
  roundedR: "rounded-r",
  roundedB: "rounded-b",
  roundedL: "rounded-l",
  roundedTl: "rounded-tl",
  roundedTr: "rounded-tr",
  roundedBr: "rounded-br",
  roundedBl: "rounded-bl",
  // Flex item
  basis: "basis",
  order: "order",
  // Paint
  bg: "bg",
  color: "color",
  borderColor: "border-color",
  shadow: "shadow",
  opacity: "opacity",
} as const;

export type ChannelPropName = keyof typeof CHANNEL_PROPS;

/** `p` -> `astralis-p`, (`p`, `md`) -> `astralis-p-md`. Plain hyphen classes:
 *  invisible to the Tailwind scanner, the safelist, and tailwind-merge. */
export const channelClass = (slug: string, bp?: string): string =>
  bp ? `astralis-${slug}-${bp}` : `astralis-${slug}`;

/* A prop NAME alone cannot decide the route: `size` is square sizing on Box
   but a typography rung on Text and a scale on Stat. The engine only takes
   the channel branch when the prop's map is a branded VALUE map — an
   unbranded map with the same key stays on the keyword/class path. The brand
   is non-enumerable, so Object.keys vocabularies and CVA are unaffected. */
const CHANNEL_MAP_BRAND = Symbol.for("astralis.channel-map");

/** Brand a token->CSS-value map as channel-routable, then freeze it. */
export function channelMap<T extends Record<string, string>>(map: T): Readonly<T> {
  Object.defineProperty(map, CHANNEL_MAP_BRAND, { value: true });
  return Object.freeze(map);
}

export function isChannelMap(map: Record<string, string> | undefined): boolean {
  return map !== undefined && (map as Record<PropertyKey, unknown>)[CHANNEL_MAP_BRAND] === true;
}

/** `p` -> `--astralis-p`, (`p`, `md`) -> `--astralis-p-md`. */
export const channelVar = (slug: string, suffix?: string): string =>
  suffix ? `--astralis-${slug}-${suffix}` : `--astralis-${slug}`;
