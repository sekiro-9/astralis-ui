"use client";

import type { ChangeEvent, Ref } from "react";
import { useSegmentedControlContext } from "../segmented-control.context";
import type { SegmentedControlItemProps } from "../segmented-control.types";
import { segmentedControlSizes, segmentedControlItem, segmentedControlItemColor } from "../segmented-control.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function SegmentedControlItem({
  value,
  children,
  disabled: disabledProp,
  className = "",
  onChange: onChangeProp,
  ref,
  ...props
}: SegmentedControlItemProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useSegmentedControlContext();
  if (!group) throw new Error("SegmentedControl.Item must be used within <SegmentedControl>");

  const isSelected = group.groupValue === value;
  const isDisabled = disabledProp ?? group.disabled;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    group.selectValue(value);
    onChangeProp?.(e);
  };

  return (
    <label className={astralisMerge("astralis:relative", group.fullWidth && "astralis:flex-1", className)}>
      <input
        ref={ref}
        type="radio"
        name={group.name}
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={handleChange}
        className="astralis:sr-only astralis:peer"
        {...props}
      />
      <span
        className={astralisMerge(
          segmentedControlSizes[group.size],
          segmentedControlItem,
          segmentedControlItemColor(isSelected),
          isDisabled ? "astralis:cursor-not-allowed" : "astralis:cursor-pointer",
        )}
      >
        {children}
      </span>
    </label>
  );
}

SegmentedControlItem.displayName = "SegmentedControl.Item";
