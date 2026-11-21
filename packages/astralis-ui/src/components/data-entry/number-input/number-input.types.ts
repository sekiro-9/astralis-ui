import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { InputRounded, InputSize, InputVariant } from "../input/input.types";
import type { ColorScheme } from "../../../const/color-schemes";

export interface NumberInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "width" | "height">, PlacementProps {
  /** Controlled numeric value; `null` = empty. */
  value?: number | null;
  defaultValue?: number | null;
  /** Fires on each commit that changes the value, with the parsed (and clamped) number or `null` when cleared. */
  onValueChange?: (value: number | null) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Increment applied by the steppers and arrow keys. @default 1 */
  step?: number;
  /** Round committed values to this many decimal places. */
  precision?: number;
  size?: InputSize;
  variant?: InputVariant;
  /** Corner radius, on Input's scale; `full` makes a pill. Unset, the variant
   *  decides: `lg` on outline and filled, square on underline and unstyled.
   *  @default "lg" */
  rounded?: InputRounded;
  /** Hue of the focus border and ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  invalid?: boolean;
  /** Hide the increment/decrement buttons. */
  hideSteppers?: boolean;
}
