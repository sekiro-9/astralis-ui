"use client";

import type { Ref } from "react";
import type { CheckableTagProps } from "../tag.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { TagRoot } from "./tag-root";
import { astralisMerge } from "../../../../utils/astralis-merge";

/** A selectable tag — solid/brand when checked, subtle/gray when not. */
export function CheckableTag({
  children,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  colorScheme = "brand",
  size = "md",
  startElement,
  endElement,
  className = "",
  ref,
  ...rest
}: CheckableTagProps & { ref?: Ref<HTMLSpanElement> }) {
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: (next: boolean) => {
      onCheckedChange?.(next);
      onChange?.(next);
    },
  });

  return (
    <TagRoot
      ref={ref}
      size={size}
      variant={checked ? "solid" : "subtle"}
      colorScheme={checked ? colorScheme : "gray"}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => setChecked(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setChecked(!checked);
        }
      }}
      startElement={startElement}
      endElement={endElement}
      className={astralisMerge(
        "astralis:cursor-pointer astralis:transition-all astralis:hover:opacity-90 astralis:active:scale-95 astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
        className,
      )}
      {...rest}
    >
      {children}
    </TagRoot>
  );
}

CheckableTag.displayName = "Tag.Checkable";
