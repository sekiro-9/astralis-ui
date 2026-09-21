"use client";

import { astralisMerge } from "../../../../utils/astralis-merge";
import { useStepsContext } from "../steps.context";
import type { StepsCompletedProps } from "../steps.types";
import { identify } from "../../../../utils/dev-identity";

/** Steps.Completed — renders once every step is done (`step === count`). */
export const StepsCompleted = identify("Steps.Completed", function StepsCompleted({ children, className, ...rest }: StepsCompletedProps) {
  const { step, count } = useStepsContext();
  if (count === 0 || step < count) return null;

  return (
    <div className={astralisMerge("astralis:w-full astralis:text-label-base", className)} {...rest}>
      {children}
    </div>
  );
});
