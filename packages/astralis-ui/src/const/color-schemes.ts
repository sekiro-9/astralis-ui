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

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/** The accent-channel scope class for a hue, e.g. `accentClass("red") === "astralis-accent-red"`. */
export const accentClass = (scheme: ColorScheme): string => `astralis-accent-${scheme}`;
