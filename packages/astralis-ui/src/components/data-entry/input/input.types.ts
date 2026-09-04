import type { PlacementProps } from "../../../utils/placement";
import type { ColorScheme } from "../../../const/color-schemes";
import type {
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "outline" | "filled" | "underline" | "unstyled";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "width" | "height"
>, PlacementProps {
  /** Visual size of the input */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Marks the input as invalid. Can also be inherited from Field context */
  invalid?: boolean;
  /** Hue of the focus border and ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  /** Extra class names */
  className?: string;
}

export interface InputGroupProps extends Omit<ComponentPropsWithoutRef<"div">, "prefix"> {
  /** Icon or element rendered at the start of the input */
  prefix?: ReactNode;
  /** Icon or element rendered at the end of the input */
  suffix?: ReactNode;
  children: ReactNode;
  className?: string;
}

export type InputPasswordProps = Omit<InputProps, "type">;

export interface InputSearchProps extends Omit<InputProps, "type"> {
  /** Callback fired when the search is submitted (Enter key or button click) */
  onSearch?: (value: string) => void;
  /** Whether to show the search button */
  showSearchButton?: boolean;
}

export interface InputTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  /** Grow with content instead of scrolling — native CSS `field-sizing:
   *  content`, zero JavaScript. `rows` becomes the minimum height. */
  autoGrow?: boolean;
  /** Visual size */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Marks the textarea as invalid */
  invalid?: boolean;
  /** Hue of the focus border and ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  /** Shows a character counter below the textarea */
  showCount?: boolean;
  /** Extra class names */
  className?: string;
}
