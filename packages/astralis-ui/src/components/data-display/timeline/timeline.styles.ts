/*
 * Timeline styling travels by CSS instead of context so the whole compound
 * stays a Server Component: the root stamps `data-timeline-size` /
 * `data-timeline-variant` (and carries the accent class, which the indicators
 * inherit through the accent CSS variables), each item stamps
 * `data-timeline-item` so the connector can hide itself on the last entry,
 * and the parts carry parent-keyed variants. md/solid are the unprefixed
 * defaults — a part outside a root renders md/solid quietly (the context
 * threw; see the 0.7.2 changelog).
 */

/** The circular indicator. Colour comes from the accent channel. */
export const timelineIndicatorClasses = [
  "astralis:inline-flex astralis:items-center astralis:justify-center astralis:rounded-full astralis:shrink-0 astralis:font-medium",
  // size — md default
  "astralis:size-6 astralis:text-xs",
  "astralis:[[data-timeline-size=sm]_&]:size-5",
  "astralis:[[data-timeline-size=lg]_&]:size-8 astralis:[[data-timeline-size=lg]_&]:text-sm",
  // variant — solid default
  "astralis:bg-accent-solid astralis:text-accent-contrast",
  "astralis:[[data-timeline-variant=subtle]_&]:bg-accent-subtle astralis:[[data-timeline-variant=subtle]_&]:text-accent-label",
  "astralis:[[data-timeline-variant=outline]_&]:bg-surface-base astralis:[[data-timeline-variant=outline]_&]:border-normal astralis:[[data-timeline-variant=outline]_&]:border-accent-stroke astralis:[[data-timeline-variant=outline]_&]:text-accent-label",
].join(" ");

/** Connector-column width matches the indicator so the line runs through its centre. */
export const timelineColumnWidth =
  "astralis:w-6 astralis:[[data-timeline-size=sm]_&]:w-5 astralis:[[data-timeline-size=lg]_&]:w-8";

/** The connecting line: hidden when its item is the last entry. */
export const timelineConnectorClasses =
  "astralis:w-px astralis:flex-1 astralis:min-h-6 astralis:bg-stroke-base astralis:mt-1 astralis:[[data-timeline-item]:last-child_&]:hidden";

export const timelineTitleSize =
  "astralis:text-sm astralis:[[data-timeline-size=lg]_&]:text-base";
