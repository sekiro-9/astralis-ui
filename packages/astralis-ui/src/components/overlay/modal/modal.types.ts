import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode, Ref } from "react";
import type { SlotElement } from "../slot";
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
  children: SlotElement;
  /** Merged with the wrapped element's own ref, never replacing it. */
  ref?: Ref<HTMLElement>;
}

export interface ModalContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Header, Body, Footer, Title and Description; DOM props reach the element. */
export interface ModalSectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export interface ModalCloseButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  ref?: Ref<HTMLButtonElement>;
}
