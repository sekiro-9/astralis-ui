"use client";

import { useId, useMemo } from "react";
import RadioGroupContext from "../radio.context";
import type { RadioGroupProps } from "../radio.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const RadioGroup = identify("Radio.Group", function RadioGroup({
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  name: nameProp,
  disabled,
  colorScheme,
  orientation = "vertical",
  children,
  className,
  ...rest
}: RadioGroupProps) {
  const field = useFieldContext();
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  const [groupValue, selectValue] = useControllableState({
    value,
    defaultValue,
    onChange: (next: string) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });

  const ctx = useMemo(
    () => ({ groupValue, selectValue, name, disabled, colorScheme }),
    [groupValue, selectValue, name, disabled, colorScheme],
  );

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        role="radiogroup"
        aria-labelledby={field?.labelledBy}
        aria-describedby={field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={field?.invalid || undefined}
        className={astralisMerge(
          "astralis:flex",
          orientation === "horizontal"
            ? "astralis:flex-row astralis:flex-wrap astralis:gap-x-6 astralis:gap-y-2"
            : "astralis:flex-col astralis:gap-2.5",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
