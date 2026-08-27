"use client";

import { createContext, useContext } from "react";
import type { SplitterContextValue } from "./splitter.types";

const SplitterContext = createContext<SplitterContextValue | null>(null);

export function useSplitterContext(): SplitterContextValue {
  const ctx = useContext(SplitterContext);
  if (!ctx) throw new Error("Splitter sub-components must be used within <Splitter>");
  return ctx;
}

export default SplitterContext;
