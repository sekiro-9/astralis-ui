import type { PlacementProps } from "../../../utils/placement";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { CheckboxSize } from "../checkbox/checkbox.types";

export interface CheckboxCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "children"
>, PlacementProps {
  /** Card title */
  children?: ReactNode;
  /** Secondary line under the title */
  description?: ReactNode;
  /** Leading slot (an icon, avatar, …) rendered beside the copy */
  addon?: ReactNode;
  /** Show the corner tick while checked. @default true */
  indicator?: boolean;
  /** Visual size. @default "md" */
  size?: CheckboxSize;
  /** Hue the checked card paints with (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  /** Invalid/error state */
  invalid?: boolean;
}
