"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef } from "../../slot";
import { HoverCardContext, useHoverCard } from "../hover-card.context";
import type { HoverCardProps, HoverCardTriggerProps } from "../hover-card.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";

/**
 * A rich preview that opens on hover intent — the "profile card on a
 * mention" pattern. Unlike Tooltip, the content is interactive: the close
 * timer gives the pointer a grace period to travel into the card, and
 * entering it cancels the close.
 */
export function HoverCardRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  openDelay = 400,
  closeDelay = 200,
  avoidCollisions = true,
}: HoverCardProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => { if (timer.current) clearTimeout(timer.current); };
  const scheduleOpen = useCallback(() => { clear(); timer.current = setTimeout(() => setOpen(true), openDelay); }, [setOpen, openDelay]);
  const scheduleClose = useCallback(() => { clear(); timer.current = setTimeout(() => setOpen(false), closeDelay); }, [setOpen, closeDelay]);
  const showNow = useCallback(() => { clear(); setOpen(true); }, [setOpen]);
  const hide = useCallback(() => { clear(); setOpen(false); }, [setOpen]);

  useEffect(() => clear, []);

  const ctx = useMemo(
    () => ({ open, scheduleOpen, scheduleClose, showNow, hide, triggerRef, contentRef, contentId: `${id}-card`, side, align, sideOffset, avoidCollisions }),
    [open, scheduleOpen, scheduleClose, showNow, hide, id, side, align, sideOffset, avoidCollisions],
  );

  return <HoverCardContext.Provider value={ctx}>{children}</HoverCardContext.Provider>;
}

HoverCardRoot.displayName = "HoverCard";

export function HoverCardTrigger({ children, ref, ...rest }: HoverCardTriggerProps) {
  const { scheduleOpen, scheduleClose, showNow, hide, open, triggerRef, contentId } = useHoverCard();
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(triggerRef, ref, slotChildRef(child));
  return cloneSlot(child, rest, {
    ref: mergedRef,
    onMouseEnter: scheduleOpen,
    onMouseLeave: scheduleClose,
    onFocus: showNow,
    onBlur: hide,
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
  });
}

HoverCardTrigger.displayName = "HoverCard.Trigger";
