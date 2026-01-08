import { createContext, useContext } from "react";
import type { StepsOrientation, StepsSize } from "./steps.types";

export interface StepsContextValue {
  value: number;
  orientation: StepsOrientation;
  size: StepsSize;
  clickable: boolean;
  onChange?: (step: number) => void;
}

export const StepsContext = createContext<StepsContextValue | null>(null);

export function useStepsContext() {
  const context = useContext(StepsContext);

  if (!context) {
    throw new Error("Step must be used within a Steps component");
  }

  return context;
}
