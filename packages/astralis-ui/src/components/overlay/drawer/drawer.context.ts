"use client";

import { createContext, useContext } from "react";
import type { DialogCoreValue } from "../dialog/dialog-core";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DrawerContextValue extends DialogCoreValue {
  placement: DrawerPlacement;
  size: DrawerSize;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer sub-components must be used within <Drawer>");
  return ctx;
}
