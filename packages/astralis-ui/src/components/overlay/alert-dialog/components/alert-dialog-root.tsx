"use client";

import { ModalRoot } from "../../modal/components/modal-root";
import type { AlertDialogProps } from "../alert-dialog.types";

/**
 * A Modal that interrupts for a decision — delete confirmations, unsaved
 * changes, destructive actions. The panel announces as an alertdialog and the
 * overlay does not dismiss; the user must pick an action (Esc still cancels).
 */
export function AlertDialogRoot({ closeOnOverlayClick = false, ...props }: AlertDialogProps) {
  return <ModalRoot role="alertdialog" closeOnOverlayClick={closeOnOverlayClick} {...props} />;
}

AlertDialogRoot.displayName = "AlertDialog";
