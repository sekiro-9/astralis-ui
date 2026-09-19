"use client";

import { createContext, useContext } from "react";
import type { DialogCoreValue } from "../dialog/dialog-core";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalRole = "dialog" | "alertdialog";

export interface ModalContextValue extends DialogCoreValue {
  /** ARIA role the panel renders with — AlertDialog sets "alertdialog". */
  role: ModalRole;
  size: ModalSize;
  centered: boolean;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal sub-components must be used within <Modal>");
  return ctx;
}
