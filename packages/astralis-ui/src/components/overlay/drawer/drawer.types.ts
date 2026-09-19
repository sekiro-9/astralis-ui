import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode, Ref } from "react";
import type { SlotElement } from "../slot";
import type { DrawerPlacement, DrawerSize } from "./drawer.context";

export interface DrawerProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Edge the drawer slides in from. @default "right" */
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

/** Trigger/Close wrap a single element; attributes other than `children` are forwarded onto it. */
export interface DrawerSlotProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: SlotElement;
  /** Merged with the wrapped element's own ref, never replacing it. */
  ref?: Ref<HTMLElement>;
}

export interface DrawerContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Header, Body, Footer, Title and Description; DOM props reach the element. */
export interface DrawerSectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export interface DrawerCloseButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  ref?: Ref<HTMLButtonElement>;
}
