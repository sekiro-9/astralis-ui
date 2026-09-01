import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode, ReactElement } from "react";
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
  children: ReactElement<any>;
}

export interface DrawerContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export interface DrawerSectionProps {
  children: ReactNode;
  className?: string;
}
