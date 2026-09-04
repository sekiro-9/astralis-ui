"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useCheckboxGroupContext } from "../checkbox.context";
import { useFieldContext } from "../../field/field.context";
import type { CheckboxProps } from "../checkbox.types";
import { checkboxSizes, checkboxControl, checkboxControlColor } from "../checkbox.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { CheckIcon, MinusIcon } from "../../../icon/internal-icons";

export function CheckboxBase({
  children,
  size = "md",
  colorScheme,
  indeterminate = false,
  invalid: invalidProp,
  disabled: disabledProp,
  checked: checkedProp,
  defaultChecked = false,
  onChange: onChangeProp,
  readOnly: readOnlyProp,
  value,
  className = "",
  id: idProp,
  ref,
  ...props
}: CheckboxProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useCheckboxGroupContext();
  const field = useFieldContext();

  const [localChecked, setLocalChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked });
  const isGroupMember = group != null && value != null;
  const isChecked = isGroupMember ? group.groupValue.includes(String(value)) : localChecked;

  const isDisabled = disabledProp ?? group?.disabled ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const isReadOnly = readOnlyProp ?? field?.readOnly;
  // A group's members share one Field; only a lone checkbox takes its id.
  const id = idProp ?? (group ? undefined : field?.id);
  const hue = colorScheme ?? group?.colorScheme ?? "brand";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // No preventDefault: on a controlled checkbox it desyncs the painted state
    // from React's (the browser un-toggles after React has already restored it).
    if (isReadOnly) return;
    if (isGroupMember) group.toggleValue(String(value));
    else setLocalChecked(e.target.checked);
    onChangeProp?.(e);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const sz = checkboxSizes[size];
  const active = isChecked || indeterminate;

  const { placementClass, rest } = splitPlacement(props);
  const { style, ...inputProps } = rest;

  return (
    <label
      className={astralisMerge(
        "astralis:inline-flex astralis:items-center astralis:gap-2",
        accentClass(hue),
        isDisabled
          ? "astralis:cursor-not-allowed astralis:opacity-moderate"
          : isReadOnly
            ? "astralis:cursor-default"
            : "astralis:cursor-pointer",
        placementClass,
        className,
      )}
      style={style}
    >
      <input
        ref={mergedRef}
        type="checkbox"
        id={id}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={group ? undefined : field?.describedBy}
        aria-readonly={isReadOnly || undefined}
        onChange={handleChange}
        className="astralis:sr-only astralis:peer"
        {...inputProps}
      />

      <span
        aria-hidden="true"
        className={astralisMerge(sz.box, checkboxControl, checkboxControlColor(active, !!isInvalid))}
      >
        {indeterminate ? (
          <MinusIcon className={astralisMerge(sz.icon, "astralis:text-accent-contrast")} />
        ) : isChecked ? (
          <CheckIcon className={astralisMerge(sz.icon, "astralis:text-accent-contrast")} />
        ) : null}
      </span>

      {children && (
        <span className={astralisMerge(sz.label, "astralis:text-label-base astralis:select-none")}>
          {children}
        </span>
      )}
    </label>
  );
}

CheckboxBase.displayName = "Checkbox";
