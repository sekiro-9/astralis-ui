"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef } from "../../slot";
import { PopoverContext, usePopover } from "../popover.context";
import type { PopoverProps, PopoverSlotProps } from "../popover.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { identify } from "../../../../utils/dev-identity";

export const PopoverRoot = identify("Popover", function PopoverRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  avoidCollisions = true,
  closeOnEsc = true,
  closeOnOutsidePointer = true,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  const ctx = useMemo(
    () => ({
      open, setOpen, toggle, close,
      triggerRef, contentRef, arrowRef,
      contentId: `${id}-content`, titleId: `${id}-title`, descriptionId: `${id}-desc`,
      hasTitle, setHasTitle, hasDescription, setHasDescription,
      side, align, sideOffset, alignOffset, avoidCollisions, closeOnEsc, closeOnOutsidePointer,
    }),
    [open, setOpen, toggle, close, id, hasTitle, hasDescription, side, align, sideOffset, alignOffset, avoidCollisions, closeOnEsc, closeOnOutsidePointer],
  );

  return <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>;
});

export const PopoverTrigger = identify("Popover.Trigger", function PopoverTrigger({ children, ref, ...rest }: PopoverSlotProps) {
  const { toggle, open, triggerRef, contentId } = usePopover();
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(triggerRef, ref, slotChildRef(child));
  return cloneSlot(child, rest, {
    ref: mergedRef,
    onClick: toggle,
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
  });
});

export const PopoverClose = identify("Popover.Close", function PopoverClose({ children, ref, ...rest }: PopoverSlotProps) {
  const { close } = usePopover();
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(ref, slotChildRef(child));
  return cloneSlot(child, rest, { ref: mergedRef, onClick: close });
});
