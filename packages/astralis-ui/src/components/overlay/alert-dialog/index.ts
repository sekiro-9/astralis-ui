import { AlertDialogRoot } from "./components/alert-dialog-root";
import { ModalTrigger, ModalClose } from "../modal/components/modal-root";
import { ModalContent } from "../modal/components/modal-content";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "../modal/components/modal-parts";

/**
 * Compound API — the parts ARE Modal's parts (same context, same styling);
 * only the root differs. No CloseButton on purpose: a forced-choice dialog
 * should resolve through its Footer actions, not an X.
 */
export const AlertDialog = Object.assign(AlertDialogRoot, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
});

export { AlertDialogRoot };

export type { AlertDialogProps } from "./alert-dialog.types";
