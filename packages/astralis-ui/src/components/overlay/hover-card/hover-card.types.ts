import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode, Ref } from "react";
import type { SlotElement } from "../slot";
import type { Side, Align } from "../../../hooks/use-anchor-position";

export interface HoverCardProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side of the trigger. @default "bottom" */
  side?: Side;
  align?: Align;
  sideOffset?: number;
  /** Delay before showing on hover, ms. @default 400 */
  openDelay?: number;
  /** Grace period before hiding — the pointer may travel to the card. @default 200 */
  closeDelay?: number;
  avoidCollisions?: boolean;
}

/** Attributes other than `children` are forwarded onto the wrapped element. */
export interface HoverCardTriggerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** A single element (typically a Link); the card wires it up via props. */
  children: SlotElement;
  /** Merged with the wrapped element's own ref, never replacing it. */
  ref?: Ref<HTMLElement>;
}

export interface HoverCardContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}
