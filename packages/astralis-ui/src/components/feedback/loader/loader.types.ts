import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * `blocks` is the Astralis mark assembling itself; `spinner` a rotating arc;
 * `dots` three dots in sequence; `bars` an equaliser; `pulse` a dot sending out
 * rings.
 */
export type LoaderVariant = "blocks" | "spinner" | "dots" | "bars" | "pulse";

export interface LoaderProps extends ComponentPropsWithoutRef<"span">, PlacementProps {
  /** Which animation. @default "blocks" */
  variant?: LoaderVariant;
  size?: LoaderSize;
  /** Hue of the indicator (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  /**
   * Accessible loading text announced to screen readers (visually hidden).
   * @default "Loading…"
   */
  label?: string;
}
