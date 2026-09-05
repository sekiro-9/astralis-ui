import type { PlacementProps } from "../../../utils/placement";
import type { ReactNode, SelectHTMLAttributes } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { InputVariant } from "../input/input.types";

export type NativeSelectSize = "sm" | "md" | "lg";
export type NativeSelectVariant = InputVariant;

export interface NativeSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
>, PlacementProps {
  /** Visual size, mirroring Input's scale. @default "md" */
  size?: NativeSelectSize;
  /** Field chrome, mirroring Input's taxonomy. @default "outline" */
  variant?: NativeSelectVariant;
  /** Hue of the focus border and ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  /** Marks the select as invalid */
  invalid?: boolean;
  /** Renders a disabled empty option shown until a value is chosen */
  placeholder?: string;
  /** Native `<option>` / `<optgroup>` children */
  children: ReactNode;
}
