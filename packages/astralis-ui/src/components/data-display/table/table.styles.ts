/*
 * Table styling is resolved by CSS instead of context so every part stays a
 * Server Component: the root's wrapper div stamps `data-table-size` plus
 * boolean `data-table-striped` / `data-table-interactive` /
 * `data-table-sticky` attributes, and the parts carry parent-keyed variants
 * on them. The md styles are the unprefixed defaults — a part rendered
 * outside a root gets md, quietly, the same contract Card has always had
 * (the old context threw instead; see the 0.7.2 changelog).
 */

/** Cell padding + text size, shared by Head and Cell. md is the default. */
export const tableCellSize = [
  "astralis:px-4 astralis:py-3 astralis:text-sm",
  "astralis:[[data-table-size=sm]_&]:px-3 astralis:[[data-table-size=sm]_&]:py-2 astralis:[[data-table-size=sm]_&]:text-xs",
  "astralis:[[data-table-size=lg]_&]:px-5 astralis:[[data-table-size=lg]_&]:py-4 astralis:[[data-table-size=lg]_&]:text-base",
].join(" ");

/**
 * Row banding + hover. Hover is one step up from wherever the row rests. In a
 * striped table that differs by row, so the striped/unstriped interactive
 * cases are spelled out — otherwise the banded rows would either not move or
 * overshoot.
 */
export const tableRowState = [
  "astralis:[[data-table-striped]_&]:even:bg-surface-subtle",
  "astralis:[[data-table-interactive]:not([data-table-striped])_&]:hover:bg-surface-subtle",
  "astralis:[[data-table-interactive][data-table-striped]_&]:odd:hover:bg-surface-subtle",
  "astralis:[[data-table-interactive][data-table-striped]_&]:even:hover:bg-surface-muted",
].join(" ");

/** Sticky header, keyed off the root's data-table-sticky attribute. */
export const tableStickyHeader =
  "astralis:[[data-table-sticky]_&]:sticky astralis:[[data-table-sticky]_&]:top-0 astralis:[[data-table-sticky]_&]:z-10";
