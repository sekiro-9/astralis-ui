import type { ModalProps } from "../modal/modal.types";

/**
 * AlertDialog is Modal with forced-choice semantics: the role is
 * "alertdialog" and dismissal must come from an explicit action — overlay
 * clicks are off by default (Esc stays on, per the ARIA pattern).
 */
export type AlertDialogProps = Omit<ModalProps, "role">;
