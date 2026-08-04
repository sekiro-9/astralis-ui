/**
 * Hand-authored declarations for the "astralis-ui/color-schemes" subpath.
 *
 * The build rolls all other types into dist/index.d.ts, so this tiny, stable
 * surface is kept by hand — update it if src/const/color-schemes.ts's exports
 * change. Same arrangement as theme-math.d.ts and serialize.d.ts.
 *
 * This subpath ships WITHOUT "use client" (see vite.config.ts and
 * scripts/check-server-safe.mjs), so Server Components, build scripts, and
 * plain Node can read COLOR_SCHEMES as real data. The same names are also
 * re-exported from the package root for convenience — but the root is a client
 * module, so prefer this subpath anywhere the value is read on the server.
 */

/**
 * Every hue `colorScheme` accepts, library-wide. Includes the four semantic
 * schemes (`error`, `warning`, `success`, `info`) alongside the plain hues.
 */
export declare const COLOR_SCHEMES: readonly [
  "brand",
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "cyan",
  "purple",
  "pink",
  "error",
  "warning",
  "success",
  "info",
];

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * The accent-channel scope class for a hue, e.g.
 * `accentClass("red") === "astralis-accent-red"`. Apply it to any element that
 * paints with the `accent-*` utilities to rebind the channel to that hue.
 */
export declare const accentClass: (scheme: ColorScheme) => string;
