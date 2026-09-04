"use client";

import { useMemo } from "react";
import CheckboxGroupContext from "../checkbox.context";
import type { CheckboxGroupProps } from "../checkbox.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function CheckboxGroup({
  value,
  defaultValue = [],
  onValueChange,
  onChange,
  disabled,
  colorScheme,
  orientation = "vertical",
  children,
  className,
  ...rest
}: CheckboxGroupProps) {
  const field = useFieldContext();
  const [groupValue, setGroupValue] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: (next) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });

  const ctx = useMemo(
    () => ({
      groupValue,
      toggleValue: (val: string) =>
        setGroupValue(groupValue.includes(val) ? groupValue.filter((v) => v !== val) : [...groupValue, val]),
      disabled,
      colorScheme,
    }),
    [groupValue, setGroupValue, disabled, colorScheme],
  );

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <div
        role="group"
        aria-labelledby={field?.labelledBy}
        aria-describedby={field?.describedBy}
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
    </CheckboxGroupContext.Provider>
  );
}

CheckboxGroup.displayName = "Checkbox.Group";
