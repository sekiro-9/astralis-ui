"use client";

import { CheckableTag } from "./checkable-tag";
import type { CheckableTagGroupProps } from "../tag.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

/** Renders a set of CheckableTags with single- or multi-select behaviour. */
export const CheckableTagGroup = identify("Tag.Group", function CheckableTagGroup({
  value,
  defaultValue = [],
  onValueChange,
  onChange,
  options,
  multiple = false,
  size = "md",
  colorScheme = "brand",
  className = "",
  style,
  ...rest
}: CheckableTagGroupProps) {
  const [selected, setSelected] = useControllableState<(string | number)[]>({
    value,
    defaultValue,
    onChange: (next) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });

  const toggle = (optionValue: string | number, isChecked: boolean) => {
    if (multiple) {
      setSelected(isChecked ? [...selected, optionValue] : selected.filter((v) => v !== optionValue));
    } else {
      setSelected(isChecked ? [optionValue] : []);
    }
  };

  return (
    <div className={astralisMerge("astralis:flex astralis:flex-wrap astralis:gap-2", className)} style={style} role="group" {...rest}>
      {options.map((option) => {
        const isObject = typeof option === "object" && option !== null;
        const optionValue = isObject ? option.value : option;
        const optionLabel = isObject ? option.label : option;
        return (
          <CheckableTag
            key={String(optionValue)}
            size={size}
            colorScheme={colorScheme}
            checked={selected.includes(optionValue)}
            onCheckedChange={(next) => toggle(optionValue, next)}
          >
            {optionLabel}
          </CheckableTag>
        );
      })}
    </div>
  );
});
