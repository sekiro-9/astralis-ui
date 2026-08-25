import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
>, PlacementProps {
  /** Number of stars. @default 5 */
  max?: number;
  /** Controlled value. Fractions render as half-stars in `readOnly` mode. */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Callback when a star is selected */
  onChange?: (value: number) => void;
  /** Visual size of the stars. @default "md" */
  size?: RatingSize;
  /** Hue the filled stars paint with (via the accent channel). @default "yellow" */
  colorScheme?: ColorScheme;
  /** Display-only: renders static stars (incl. halves) with an `img` role */
  readOnly?: boolean;
  /** Disables interaction */
  disabled?: boolean;
  /** Accessible name for the group. @default "Rating" */
  label?: string;
  /** Name attribute shared by the star radios (defaults to a generated id) */
  name?: string;
}
