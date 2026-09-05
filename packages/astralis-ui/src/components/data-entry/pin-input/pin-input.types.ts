import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { InputVariant } from "../input/input.types";

export type PinInputType = "numeric" | "alphanumeric" | "alpha";
export type PinInputSize = "sm" | "md" | "lg";
export type PinInputVariant = InputVariant;

/** The group is named by `aria-label`/`aria-labelledby`, else by the
 *  surrounding `Field.Label`, else "PIN input". */
export interface PinInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue">, PlacementProps {
  /** Number of individual boxes (default 4) */
  length?: number;
  /** Controlled value — the full combined string */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Fires whenever any box changes; receives the full combined string */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: string) => void;
  /** Fires when every box has been filled */
  onComplete?: (value: string) => void;
  /** Character type validation */
  type?: PinInputType;
  /** Masks characters like a password field */
  mask?: boolean;
  size?: PinInputSize;
  /** Cell chrome, the same set as Input's. @default "outline" */
  variant?: PinInputVariant;
  /** Hue of the focused cell's border and ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  disabled?: boolean;
  invalid?: boolean;
  /** Marks the pin input as read-only */
  readOnly?: boolean;
  /** Placeholder character shown in empty boxes */
  placeholder?: string;
  /** Auto-focus the first box on mount */
  autoFocus?: boolean;
  className?: string;
  id?: string;
}
