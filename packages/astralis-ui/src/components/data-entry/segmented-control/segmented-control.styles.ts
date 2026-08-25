import type { SegmentedControlSize } from "./segmented-control.types";

/** The recessed track the segments sit in. */
export const segmentedControlTrack =
  "astralis:inline-flex astralis:items-stretch astralis:gap-1 astralis:p-1 astralis:rounded-lg " +
  "astralis:bg-surface-subtle astralis:border-normal astralis:border-stroke-subtle";

export const segmentedControlSizes: Record<SegmentedControlSize, string> = {
  sm: "astralis:h-7 astralis:px-2.5 astralis:text-xs",
  md: "astralis:h-8 astralis:px-3 astralis:text-sm",
  lg: "astralis:h-10 astralis:px-4 astralis:text-base",
};

/** Chrome shared by every segment; the radio itself is sr-only, so focus rides
 *  the peer variant like Switch. */
export const segmentedControlItem =
  "astralis:inline-flex astralis:items-center astralis:justify-center astralis:gap-1.5 " +
  "astralis:w-full astralis:rounded-md astralis:font-medium astralis:whitespace-nowrap " +
  "astralis:select-none astralis:transition-colors " +
  "astralis:peer-focus-visible:ring-2 astralis:peer-focus-visible:ring-accent-ring astralis:peer-focus-visible:ring-offset-2 astralis:peer-focus-visible:ring-offset-surface-base";

/** Segment fill given its state — the selected segment reads as a raised card. */
export function segmentedControlItemColor(selected: boolean): string {
  return selected
    ? "astralis:bg-surface-base astralis:text-label-base astralis:shadow-sm"
    : "astralis:text-label-muted astralis:hover:text-label-base";
}
