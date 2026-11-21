import type { RatingSize } from "./rating.types";

export const ratingSizes: Record<RatingSize, string> = {
  sm: "astralis:size-4",
  md: "astralis:size-5",
  lg: "astralis:size-6",
};

export const ratingRoot = "astralis:inline-flex astralis:items-center astralis:gap-0.5";

/** Star wrapper — carries the focus ring for the sr-only radio inside its label. */
export const ratingStar =
  "astralis:inline-flex astralis:rounded-sm astralis:transition-colors " +
  "astralis:peer-focus-visible:ring-2 astralis:peer-focus-visible:ring-accent-ring astralis:peer-focus-visible:ring-offset-1 astralis:peer-focus-visible:ring-offset-surface-base";

/** Fill state — filled stars paint from the accent channel. Empty stars are
 *  solid in a neutral grey, which stays visible at 16px on base and muted
 *  surfaces where a thin outline faded out; when invalid they are red outlines. */
export function ratingStarColor(filled: boolean, invalid = false): string {
  if (filled) return "astralis:text-accent-solid";
  return invalid ? "astralis:text-error-label" : "astralis:text-stroke-muted";
}
