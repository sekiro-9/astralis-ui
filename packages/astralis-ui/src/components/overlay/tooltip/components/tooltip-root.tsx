"use client";

import { useCallback, useId, useMemo, useRef, cloneElement, type FocusEvent, type MouseEvent } from "react";
import { resolveServerChild } from "../../../../utils/resolve-server-child";
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

  const ctx = useMemo(
    () => ({ open, show, showNow, hide, triggerRef, contentRef, tooltipId: `${id}-tip`, side, align, sideOffset, avoidCollisions }),
    [open, show, showNow, hide, id, side, align, sideOffset, avoidCollisions],
  );

  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { show, showNow, hide, open, triggerRef, tooltipId } = useTooltip();
  const child = resolveServerChild(children) as TooltipTriggerProps["children"];
  return cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: (e: MouseEvent) => { child.props.onMouseEnter?.(e); show(); },
    onMouseLeave: (e: MouseEvent) => { child.props.onMouseLeave?.(e); hide(); },
    onFocus: (e: FocusEvent) => { child.props.onFocus?.(e); showNow(); },
    onBlur: (e: FocusEvent) => { child.props.onBlur?.(e); hide(); },
    "aria-describedby": open ? tooltipId : undefined,
  } as Record<string, unknown>);
}
