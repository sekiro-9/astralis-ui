// The barrel is a server module on purpose: client boundaries live per-module
// (each genuinely-client source file carries its own "use client", mirrored
// into dist by the build), so a Server Component importing from here gets real
// objects for the server-safe components and client references only for the
// interactive ones.

// Components
export * from './components';

// Theme
export * from './theme';

// The colorScheme hue list. The dedicated "astralis-ui/color-schemes" subpath
// remains for build scripts and Node tools that don't want the barrel.
export { COLOR_SCHEMES, accentClass, type ColorScheme } from './const/color-schemes';

// The values each style prop accepts, for pickers/docs/codemods. Derived from
// the style maps, which are plain data — usable on either side of the boundary.
export {
  BOX_STYLE_TOKENS,
  FLEX_STYLE_TOKENS,
  GRID_STYLE_TOKENS,
  type StylePropTokens,
} from './const/style-prop-tokens';