"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef } from "../../slot";
import { TooltipContext, useTooltip } from "../tooltip.context";
import type { TooltipProps, TooltipTriggerProps } from "../tooltip.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";

export function TooltipRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "top",
  align = "center",
  sideOffset = 6,
  delay = 300,
  avoidCollisions = true,
}: TooltipProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => { if (timer.current) clearTimeout(timer.current); };
  const show = useCallback(() => { clear(); timer.current = setTimeout(() => setOpen(true), delay); }, [setOpen, delay]);
  const showNow = useCallback(() => { clear(); setOpen(true); }, [setOpen]);
  const hide = useCallback(() => { clear(); setOpen(false); }, [setOpen]);

  useEffect(() => clear, []);

  const ctx = useMemo(
    () => ({ open, show, showNow, hide, triggerRef, contentRef, tooltipId: `${id}-tip`, side, align, sideOffset, avoidCollisions }),
    [open, show, showNow, hide, id, side, align, sideOffset, avoidCollisions],
  );

  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>;
}
TooltipRoot.displayName = "Tooltip";

export function TooltipTrigger({ children, ref, ...rest }: TooltipTriggerProps) {
  const { show, showNow, hide, open, triggerRef, tooltipId } = useTooltip();
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(triggerRef, ref, slotChildRef(child));
  return cloneSlot(child, rest, {
    ref: mergedRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: showNow,
    onBlur: hide,
    "aria-describedby": open ? tooltipId : undefined,
  });
}
TooltipTrigger.displayName = "Tooltip.Trigger";
