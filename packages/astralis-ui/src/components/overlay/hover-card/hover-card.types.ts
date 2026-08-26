import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
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

export interface HoverCardTriggerProps {
  /** A single element (typically a Link); the card wires it up via props. */
  children: ReactElement<Record<string, unknown>>;
}

export interface HoverCardContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}
