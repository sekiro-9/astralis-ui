"use client";

import { useId, useState } from "react";
import SegmentedControlContext from "../segmented-control.context";
import type { SegmentedControlProps } from "../segmented-control.types";
import { segmentedControlTrack } from "../segmented-control.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * A single-choice control styled as connected segments — the "view switcher"
 * pattern. Built on native radios (sr-only), so arrow-key movement, form
 * participation and radio semantics come from the platform.
 */
export function SegmentedControl({
  value,
  defaultValue = "",
  onChange,
  name: nameProp,
  size = "md",
  disabled,
  fullWidth,
  children,
  className,
  ...rest
}: SegmentedControlProps) {
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const groupValue = value ?? internalValue;

  const selectValue = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <SegmentedControlContext.Provider value={{ groupValue, selectValue, name, size, disabled, fullWidth }}>
      <div
        role="radiogroup"
        className={astralisMerge(
          segmentedControlTrack,
          fullWidth && "astralis:flex astralis:w-full",
          disabled && "astralis:opacity-moderate",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}

SegmentedControl.displayName = "SegmentedControl";
