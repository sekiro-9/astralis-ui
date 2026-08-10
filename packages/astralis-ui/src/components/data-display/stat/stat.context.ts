import { createContext, useContext } from "react";
import type { ResponsiveProp } from "../../../utils/responsive";
import type { StatSize } from "./stat.types";

export interface StatContextValue {
  /** Carried through unresolved so each part can resolve its own rung. */
  size: ResponsiveProp<StatSize>;
}

export const StatContext =
  createContext<StatContextValue | null>(null);

export function useStat() {
  const ctx = useContext(StatContext);
  if (!ctx) {
    throw new Error("Stat components must be used within <Stat>");
  }
  return ctx;
}

/**
 * The size a part should render at. Parts are flat-exported, so one can legally
 * appear outside a root — it falls back to `md` rather than throwing, which is
 * what `useStat` does.
 */
export function useStatSize(): ResponsiveProp<StatSize> {
  return useContext(StatContext)?.size ?? "md";
}
