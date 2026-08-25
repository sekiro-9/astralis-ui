import type { ReactNode } from "react";
import type { ButtonProps } from "../button/button.types";

export interface CopyButtonProps extends Omit<ButtonProps<"button">, "as" | "leftIcon"> {
  /** The text written to the clipboard */
  value: string;
  /** Label while in the copied state. @default "Copied" */
  copiedLabel?: ReactNode;
  /** How long the copied state lasts, in ms. @default 1600 */
  timeout?: number;
}
