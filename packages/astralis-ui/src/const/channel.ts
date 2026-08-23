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

/**
 * Widens channel props to accept arbitrary CSS values while keeping token
 * autocomplete: `SpacingToken | (string & {})` still surfaces the token
 * literals in editor suggestions, but any string typechecks. The engine
 * delivers unknown strings straight into the channel var (see
 * `resolveChannelToken`), so `p="37px"` and `w="calc(100vw - 200px)"` work
 * without a class existing for them — values are invisible to the CSS build.
 *
 * `Skip` is for the name-collision components: a prop is only widened when it
 * is channel-ROUTED, and routing needs the branded map, which the type system
 * cannot see. Box's `size` is square sizing (channel); Text's and Stat's is a
 * scale rung (keyword) and must stay a closed set — pass `"size"` as `Skip`
 * wherever the keyword meaning applies.
 */
export type WidenChannelProps<Props, Skip extends PropertyKey = never> = {
  [K in keyof Props]: K extends Exclude<ChannelPropName, Skip>
    ? Props[K] | (string & {})
    : Props[K];
};

/** `p` -> `astralis-p`, (`p`, `md`) -> `astralis-p-md`. Plain hyphen classes:
 *  invisible to the Tailwind scanner, the safelist, and tailwind-merge. */
export const channelClass = (slug: string, bp?: string): string =>
  bp ? `astralis-${slug}-${bp}` : `astralis-${slug}`;

/*
 * Container-query responsive keys. Same four names and the same rem
 * thresholds as the viewport breakpoints — one mental model, one token set —
 * but prefixed with "@" and resolved against the NEAREST ANCESTOR CONTAINER
 * (an element carrying the `container` prop) instead of the viewport:
 *
 *   <Box container>
 *     <Card size={{ base: "sm", "@md": "lg" }} />   // md = the Box is >=48rem
 *   </Box>
 *
 * The widths must stay literal here (CSS forbids var() in @container exactly
 * as in @media); the coverage gate asserts they match --breakpoint-* in the
 * theme, the @media literals in channels.css, and the @container literals.
 * With no container ancestor, @container rules resolve against the small
 * viewport — the prop appears inert. That failure mode is documented, and the
 * validator warns when "@" keys are used with no `container` in the file.
 */
export const CONTAINER_BREAKPOINT_WIDTHS = {
  "@sm": "40rem",
  "@md": "48rem",
  "@lg": "64rem",
  "@xl": "80rem",
} as const;

export type ContainerKey = keyof typeof CONTAINER_BREAKPOINT_WIDTHS;

/** `"@md"` -> channel class/var suffix `"cq-md"`. */
export const containerSuffix = (key: string): string => `cq-${key.slice(1)}`;

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

/* The only channel props whose CSS property takes a plain number — a bare
   numeric pass-through is valid there and must not warn. Everything else is a
   length, color, or shadow, where `p="37"` is almost certainly a typo'd token
   or a missing unit. Exported so the system spec (and therefore the
   validator) carries the exact same rule the runtime warning uses. */
export const UNITLESS_CHANNEL_SLUGS: ReadonlySet<string> = new Set(["order", "opacity"]);

/** `"37"`, `"-2.5"`, `".5"` — a number with no unit. */
const BARE_NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;

/**
 * Token -> CSS value, with arbitrary pass-through: a string that is not in
 * the token map rides the channel var untouched (`p="37px"`,
 * `w="calc(100vw - 200px)"`, `bg="#0ea5e9"`). The channel rule reads the var
 * either way — the cascade never cared where the value came from, only the
 * safelist did, and values don't need to exist at build time.
 *
 * Token lookups use `=== undefined`, never truthiness — "0" is a real token.
 * Non-strings and empty strings resolve to nothing, same as before.
 */
export function resolveChannelToken(
  map: Record<string, string>,
  token: unknown,
  slug: string,
): string | undefined {
  const css = map[token as string];
  if (css !== undefined) return css;
  if (typeof token !== "string" || token === "") return undefined;

  if (process.env.NODE_ENV !== "production") {
    if (BARE_NUMBER.test(token) && !UNITLESS_CHANNEL_SLUGS.has(slug)) {
      console.warn(
        `[astralis-ui] ${slug}="${token}" is not a token, and a bare number is not valid CSS for this property — did you mean a token, or "${token}px"? Passing it through as-is.`,
      );
    }
  }

  return token;
}
