"use client";

import { useId, useMemo } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import SegmentedControlContext from "../segmented-control.context";
import type { SegmentedControlProps } from "../segmented-control.types";
import { segmentedControlTrack } from "../segmented-control.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";

/**
 * A single-choice control styled as connected segments — the "view switcher"
 * pattern. Built on native radios (sr-only), so arrow-key movement, form
 * participation and radio semantics come from the platform.
 */
export function SegmentedControl({
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  name: nameProp,
  size = "md",
  colorScheme,
  disabled: disabledProp,
  invalid: invalidProp,
  fullWidth,
  children,
  className,
  ...rest
}: SegmentedControlProps) {
  const field = useFieldContext();
  const disabled = disabledProp ?? field?.disabled;
  const invalid = invalidProp ?? field?.invalid;
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
    () => ({ groupValue, selectValue, name, size, disabled, fullWidth, accented: colorScheme !== undefined }),
    [groupValue, selectValue, name, size, disabled, fullWidth, colorScheme],
  );

  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <SegmentedControlContext.Provider value={ctx}>
      <div
        role="radiogroup"
        aria-labelledby={field?.labelledBy}
        aria-describedby={field?.describedBy}
        aria-invalid={invalid || undefined}
        aria-required={field?.required || undefined}
        className={astralisMerge(
          segmentedControlTrack,
          colorScheme && accentClass(colorScheme),
          fullWidth && "astralis:flex astralis:w-full",
          invalid && "astralis:border-error-solid",
          disabled && "astralis:opacity-moderate",
          placementClass,
          className,
        )}
        {...domProps}
      >
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}

SegmentedControl.displayName = "SegmentedControl";
