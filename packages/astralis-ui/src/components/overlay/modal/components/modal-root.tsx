"use client";

import { useMemo } from "react";
import { ModalContext, useModal } from "../modal.context";
import type { ModalProps, ModalSlotProps } from "../modal.types";
import { useDialogCore } from "../../dialog/dialog-core";
import { DialogClosePart, DialogTriggerPart } from "../../dialog/dialog-parts";
import { identify } from "../../../../utils/dev-identity";

export const ModalRoot = identify("Modal", function ModalRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  size = "md",
  centered = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  role = "dialog",
}: ModalProps) {
  const core = useDialogCore({ open, defaultOpen, onOpenChange, closeOnOverlayClick, closeOnEsc });
  const ctx = useMemo(() => ({ ...core, size, centered, role }), [core, size, centered, role]);
  return <ModalContext.Provider value={ctx}>{children}</ModalContext.Provider>;
});

/** Wraps a single element and opens the modal on click (asChild-style). */
export const ModalTrigger = identify("Modal.Trigger", function ModalTrigger(props: ModalSlotProps) {
  const ctx = useModal();
  return <DialogTriggerPart ctx={ctx} {...props} />;
});

/** Wraps a single element and closes the modal on click. */
export const ModalClose = identify("Modal.Close", function ModalClose(props: ModalSlotProps) {
  const ctx = useModal();
  return <DialogClosePart ctx={ctx} {...props} />;
});
