import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode, ReactElement } from "react";
import type { ModalRole, ModalSize } from "./modal.context";

export interface ModalProps {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: ModalSize;
  /** Vertically centre the panel (otherwise it sits toward the top). @default true */
  centered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  /** ARIA role the panel renders with. AlertDialog passes "alertdialog"; leave the default otherwise. @default "dialog" */
  role?: ModalRole;
}

/** Trigger/Close wrap a single element and augment it (asChild-style);
 *  attributes other than `children` are forwarded onto it. */
export interface ModalSlotProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: ReactElement<any>;
}

export interface ModalContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export interface ModalSectionProps {
  children: ReactNode;
  className?: string;
}
