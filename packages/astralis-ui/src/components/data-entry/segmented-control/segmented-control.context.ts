"use client";

import { createContext, useContext } from "react";
import type { SegmentedControlContextValue } from "./segmented-control.types";

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControlContext() {
  return useContext(SegmentedControlContext);
}

export default SegmentedControlContext;
