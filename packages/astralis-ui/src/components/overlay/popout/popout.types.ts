import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type PopoutSide = "top" | "bottom" | "left" | "right";
export type PopoutAlign = "start" | "center" | "end";

export interface PopoutProps {
  children?: ReactNode;
}

export interface PopoutTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Injected by the Popout root — pairs the button with its panel. */
  popoutId?: string;
  children?: ReactNode;
}

export interface PopoutContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Injected by the Popout root. */
  popoutId?: string;
  /** Which side of the trigger the panel opens on. @default "bottom" */
  side?: PopoutSide;
  /** Alignment along that side. @default "start" */
  align?: PopoutAlign;
  /** Gap between trigger and panel, px. @default 8 */
  sideOffset?: number;
  children?: ReactNode;
}
