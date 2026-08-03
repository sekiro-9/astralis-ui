"use client";

// Components
export * from './components';

// Theme
export * from './theme';

/*
 * The colorScheme hue list. Re-exported here so `import { COLOR_SCHEMES } from
 * "astralis-ui"` works in client code, which is where a scheme picker usually
 * lives. This module carries "use client", so anything reading the value on the
 * server (Server Components, build scripts, Node) must import the bannerless
 * subpath "astralis-ui/color-schemes" instead — from here it would arrive as a
 * client reference and COLOR_SCHEMES.map() would fail.
 */
export { COLOR_SCHEMES, accentClass, type ColorScheme } from './const/color-schemes';

/*
 * The values each style prop accepts. Client-only by design: this is for
 * building pickers, and it pulls in the component style maps it derives from.
 * Anything needing these on the server should read the token maps directly.
 */
export {
  BOX_STYLE_TOKENS,
  FLEX_STYLE_TOKENS,
  GRID_STYLE_TOKENS,
  type StylePropTokens,
} from './const/style-prop-tokens';