import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type SliderSize = "sm" | "md" | "lg";

export interface SliderMark {
  value: number;
  label?: string;
}

interface SliderSharedProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue">, PlacementProps {
  min?: number;
  max?: number;
  /** Increment for dragging and the arrow keys; PageUp/PageDown move by about a tenth of the range. @default 1 */
  step?: number;
  size?: SliderSize;
  /** Hue for the filled track and thumb (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  /** Show value tooltip on the thumb. @default true */
  showTooltip?: boolean;
  /** true = auto-marks at each step; array = custom marks */
  marks?: boolean | SliderMark[];
  disabled?: boolean;
  invalid?: boolean;
  /** Marks the slider as read-only */
  readOnly?: boolean;
  /** Submits the value with a surrounding form through a hidden input. */
  name?: string;
  /** Human-readable value for assistive tech, e.g. `(v) => \`${v}%\``. */
  getAriaValueText?: (value: number) => string;
  className?: string;
}

/**
 * `aria-label`, `aria-labelledby` and `aria-describedby` name the thumb (the
 * `role="slider"` element), not the wrapper. Inside a `Field`, the thumb is
 * labelled by `Field.Label` automatically.
 */
export interface SliderProps extends SliderSharedProps {
  /** Controlled value */
  value?: number;
  defaultValue?: number;
  /** Fires with the new value on every change. */
  onValueChange?: (value: number) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: number) => void;
  /** Lands on the thumb, so `Field` wiring and `document.getElementById` reach the control. */
  id?: string;
}

/**
 * The root is a labelled `role="group"`: `aria-label`/`aria-labelledby` name
 * the pair, and `thumbLabels` name each thumb.
 */
export interface RangeSliderProps extends SliderSharedProps {
  /** Controlled value as [start, end] */
  value?: [number, number];
  defaultValue?: [number, number];
  /** Fires with the new range on every change. */
  onValueChange?: (value: [number, number]) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: [number, number]) => void;
  /** Accessible names for the two thumbs. @default ["Start value", "End value"] */
  thumbLabels?: [string, string];
}
