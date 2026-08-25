import type { PlacementProps } from "../../../utils/placement";
import type { ReactNode, SelectHTMLAttributes } from "react";

export type NativeSelectSize = "sm" | "md" | "lg";
export type NativeSelectVariant = "outline" | "filled";

export interface NativeSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
>, PlacementProps {
  /** Visual size, mirroring Input's scale. @default "md" */
  size?: NativeSelectSize;
  /** Field chrome, mirroring Input's taxonomy. @default "outline" */
  variant?: NativeSelectVariant;
  /** Marks the select as invalid */
  invalid?: boolean;
  /** Renders a disabled empty option shown until a value is chosen */
  placeholder?: string;
  /** Native `<option>` / `<optgroup>` children */
  children: ReactNode;
}
