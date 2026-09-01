import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { MenuProps } from "../menu.types";

/** ContextMenu reuses Menu's machinery; side/align are fixed to the pointer. */
export interface ContextMenuProps extends Omit<MenuProps, "side" | "align"> {
  children: ReactNode;
}

/** Attributes other than `children` are forwarded onto the wrapped element. */
export interface ContextMenuTriggerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** A single element; right-clicking it (or its subtree) opens the menu at the pointer. */
  children: ReactElement<Record<string, unknown>>;
}
