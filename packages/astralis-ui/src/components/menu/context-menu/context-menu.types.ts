import type { ReactElement, ReactNode } from "react";
import type { MenuProps } from "../menu.types";

/** ContextMenu reuses Menu's machinery; side/align are fixed to the pointer. */
export interface ContextMenuProps extends Omit<MenuProps, "side" | "align"> {
  children: ReactNode;
}

export interface ContextMenuTriggerProps {
  /** A single element; right-clicking it (or its subtree) opens the menu at the pointer. */
  children: ReactElement<Record<string, unknown>>;
}
