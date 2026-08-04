import { COLOR_SCHEMES } from "astralis-ui/color-schemes";

/**
 * The `colorScheme` palette for props tables and (later) playground controls.
 *
 * Imported from the library's own `COLOR_SCHEMES`, not copied. Six props
 * modules each carried their own hand-written list and five had gone stale at
 * 11 entries — the four semantic hues (error/warning/success/info) were added
 * to the library and the tables never caught up, so Button documented a
 * narrower type than it actually accepts.
 *
 * The `astralis-ui/color-schemes` subpath ships without "use client" precisely
 * so this works on the server: docs-markdown.ts reads COLOR_SCHEME_TYPE while
 * generating agent markdown, and importing from the package root would hand it
 * a client reference instead of the value.
 */
export { COLOR_SCHEMES };
export type { ColorScheme } from "astralis-ui/color-schemes";

/**
 * What a props table shows for a `colorScheme` row. Prose rather than the full
 * union: fifteen quoted literals in a table cell is unreadable, and the
 * playground will take its options from COLOR_SCHEMES itself, not from this
 * string. The count is derived, so a table can never claim a number it isn't
 * listing.
 */
export const COLOR_SCHEME_TYPE = `all ${COLOR_SCHEMES.length} schemes`;
