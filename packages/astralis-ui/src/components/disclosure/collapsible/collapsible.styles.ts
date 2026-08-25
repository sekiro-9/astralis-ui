/*
 * Zero-JS styling notes:
 * - The summary keeps its native `display: list-item` and hides the default
 *   marker via `::marker` content — swapping display for flex is the known
 *   way to break expanded/collapsed announcement in Firefox + VoiceOver
 *   (Scott O'Hara, 2022). The layout row is an inner span instead.
 * - The chevron rotates off the `[open]` attribute — parent-keyed CSS, the
 *   same no-context technique the de-contexted compounds use.
 */
export const collapsibleRootClasses =
  "astralis:group astralis:border-b astralis:border-stroke-subtle";

export const collapsibleTriggerClasses =
  "astralis:cursor-pointer astralis:list-item astralis:list-none astralis:[&::-webkit-details-marker]:hidden astralis:py-3 astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring";

export const collapsibleTriggerRowClasses =
  "astralis:flex astralis:items-center astralis:justify-between astralis:gap-3 astralis:font-medium astralis:text-label-base astralis:text-sm";

export const collapsibleIndicatorClasses =
  "astralis:shrink-0 astralis:transition-transform astralis:duration-moderate astralis:group-open:rotate-180";

export const collapsibleContentClasses =
  "astralis:pb-4 astralis:text-sm astralis:text-label-muted";
