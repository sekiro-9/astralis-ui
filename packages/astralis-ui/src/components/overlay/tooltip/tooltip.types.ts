import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { SlotElement } from "../slot";
import type { Side, Align } from "../../../hooks/use-anchor-position";

export interface TooltipProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side of the trigger. @default "top" */
  side?: Side;
  align?: Align;
  sideOffset?: number;
  /** Delay before showing on hover, ms. @default 300 */
  delay?: number;
  avoidCollisions?: boolean;
}

/** Wraps a single element; attributes other than `children` are forwarded onto it. */
export interface TooltipTriggerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: SlotElement;
  /** Merged with the wrapped element's own ref, never replacing it. */
  ref?: Ref<HTMLElement>;
}

export interface TooltipContentProps {
  children: ReactNode;
  className?: string;
  /** Render an arrow pointing at the trigger. @default false */
  withArrow?: boolean;
}
