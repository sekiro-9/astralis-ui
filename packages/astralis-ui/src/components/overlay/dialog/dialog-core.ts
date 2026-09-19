"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useControllableState } from "../../../hooks/use-controllable-state";
import { useOverlayBehavior } from "../../../hooks/use-overlay-behavior";
import { usePresence } from "../../../hooks/use-presence";

/** The state Modal, Drawer and AlertDialog share; their contexts extend it. */
export interface DialogCoreValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  setHasTitle: (v: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (v: boolean) => void;
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
}

export interface DialogCoreOptions {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
}

export function useDialogCore({
  open: openProp,
  defaultOpen,
  onOpenChange,
  closeOnOverlayClick,
  closeOnEsc,
}: DialogCoreOptions): DialogCoreValue {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const close = useCallback(() => setOpen(false), [setOpen]);

  return useMemo(
    () => ({
      open, setOpen, close,
      titleId: `${id}-title`,
      descriptionId: `${id}-desc`,
      hasTitle, setHasTitle, hasDescription, setHasDescription,
      closeOnOverlayClick, closeOnEsc,
    }),
    [open, setOpen, close, id, hasTitle, hasDescription, closeOnOverlayClick, closeOnEsc],
  );
}

/**
 * Presence, modal behaviour and the panel's ARIA wiring for a dialog's content
 * part. The caller renders its own backdrop and panel chrome.
 */
export function useDialogPanel(ctx: DialogCoreValue, { duration, role = "dialog" }: { duration: number; role?: string }) {
  const { mounted, state } = usePresence(ctx.open, duration);
  const { containerRef } = useOverlayBehavior(ctx.open, ctx.setOpen, { closeOnEsc: ctx.closeOnEsc });

  return {
    mounted,
    isOpen: state === "open",
    containerRef,
    backdropProps: {
      "aria-hidden": true,
      onClick: ctx.closeOnOverlayClick ? ctx.close : undefined,
    },
    panelProps: {
      role,
      "aria-modal": true,
      "aria-labelledby": ctx.hasTitle ? ctx.titleId : undefined,
      "aria-describedby": ctx.hasDescription ? ctx.descriptionId : undefined,
      tabIndex: -1,
    },
  };
}
