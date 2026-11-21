/**
 * The library-wide `colorScheme` palette. Any component that paints with the
 * `accent-*` utilities can expose `colorScheme` by applying `accentClass(scheme)` —
 * the scope class that rebinds the accent channel to a real hue (see accent.css).
 *
 * Must list exactly the palettes in HUES (theme/token-spec.ts), which also
 * generates the `.astralis-accent-{hue}` blocks; the token-sync gate checks both.
 */
export const COLOR_SCHEMES = [
  "brand", "gray", "red", "orange", "yellow", "green", "teal", "blue", "cyan", "purple", "pink",
  "error", "warning", "success", "info",
] as const;

/** One of the 15 palettes in `COLOR_SCHEMES`. */
export type ColorSchemeHue = (typeof COLOR_SCHEMES)[number];

/**
 * What a `colorScheme` prop takes: a hue, or `"inherit"`, which applies no
 * scheme of its own and paints with the one in scope (an ancestor's
 * `accentClass`, or brand when there is none).
 */
export type ColorScheme = ColorSchemeHue | "inherit";

/** The accent-channel scope class for a hue, e.g. `accentClass("red") === "astralis-accent-red"`;
 *  `accentClass("inherit")` is no class at all. */
export const accentClass = (scheme: ColorScheme): string =>
  scheme === "inherit" ? "" : `astralis-accent-${scheme}`;
