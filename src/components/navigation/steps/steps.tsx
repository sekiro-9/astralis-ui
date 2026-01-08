import {
  Children,
  isValidElement,
  cloneElement,
  type ReactElement,
} from "react";
import { StepsContext } from "./steps.context";
import type { StepsProps, StepProps } from "./steps.types";

export function Steps({
  value,
  orientation = "horizontal",
  size = "md",
  clickable = false,
  onChange,
  children,
}: StepsProps) {
  return (
    <StepsContext.Provider
      value={{ value, orientation, size, clickable, onChange }}
    >
      <div
        className={[
          "astralis-flex",
          orientation === "horizontal"
            ? "astralis-flex-row astralis-items-start astralis-gap-6"
            : "astralis-flex-col astralis-gap-4",
        ].join(" ")}
      >
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return null;

          // 🔑 Narrow the element type
          const step = child as ReactElement<StepProps>;

          return cloneElement(step, {
            index,
          });
        })}
      </div>
    </StepsContext.Provider>
  );
}
