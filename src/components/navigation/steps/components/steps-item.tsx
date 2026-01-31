import { useState } from "react";
import type { StepsItemProps } from "../steps.types";
import {
  StepsItemContext,
  useSteps,
  useStepsList,
  type StepState,
} from "../steps.context";

export function StepsItem({
  children,
  status,
  disabled = false,
  className = "",
}: StepsItemProps & { className?: string }) {
  const { value } = useSteps();
  const { registerItem } = useStepsList();

  const [index] = useState(() => registerItem());

  let state: StepState = "wait";

  if (status) {
    state = status;
  } else if (index < value) {
    state = "finish";
  } else if (index === value) {
    state = "process";
  } else {
    state = "wait";
  }

  return (
    <StepsItemContext.Provider value={{ index, state, isDisabled: disabled }}>
      <div
        role="listitem"
        data-state={state}
        data-status={state}
        className={[
          "astralis-flex astralis-items-start astralis-gap-4",
          "astralis-flex-1",
          // Base container styling
          "astralis-group",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </StepsItemContext.Provider>
  );
}
