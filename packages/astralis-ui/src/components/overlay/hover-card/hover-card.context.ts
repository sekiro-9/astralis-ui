"use client";

import { createContext, useContext, type RefObject } from "react";
import type { Side, Align } from "../../../hooks/use-anchor-position";

export interface HoverCardContextValue {
  open: boolean;
  /** Show after openDelay (pointer enter). */
  scheduleOpen: () => void;
  /** Hide after closeDelay — cancelled if the pointer reaches the card. */
  scheduleClose: () => void;
  /** Show immediately (keyboard focus). */
  showNow: () => void;
  /** Hide immediately (blur / Escape). */
  hide: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  contentId: string;
  side: Side;
  align: Align;
  sideOffset: number;
  avoidCollisions: boolean;
}

export const HoverCardContext = createContext<HoverCardContextValue | null>(null);

export function useHoverCard(): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard sub-components must be used within <HoverCard>");
  return ctx;
}
