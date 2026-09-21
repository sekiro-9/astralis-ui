"use client";

import type { ChangeEvent, Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useRadioGroupContext } from "../radio.context";
import { useFieldContext } from "../../field/field.context";
import type { RadioProps } from "../radio.types";
import { radioSizes, radioControl, radioControlColor } from "../radio.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { identify } from "../../../../utils/dev-identity";

export const RadioBase = identify("Radio", function RadioBase({
  children,
  size = "md",
  colorScheme,
  invalid: invalidProp,
  disabled: disabledProp,
  checked: checkedProp,
  defaultChecked = false,
  onChange: onChangeProp,
  readOnly: readOnlyProp,
  value,
  name: nameProp,
  className = "",
  id: idProp,
  ref,
  ...props
}: RadioProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useRadioGroupContext();
  const field = useFieldContext();

  const [localChecked, setLocalChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked });
  const isGroupMember = group != null && value != null;
  const isChecked = isGroupMember ? group.groupValue === String(value) : localChecked;

  const isDisabled = disabledProp ?? group?.disabled ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const isReadOnly = readOnlyProp ?? field?.readOnly;
  // A group's members share one Field; only a lone radio takes its id.
  const id = idProp ?? (group ? undefined : field?.id);
  const name = nameProp ?? group?.name;
  const hue = colorScheme ?? group?.colorScheme ?? "brand";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // No preventDefault: on a controlled checkbox it desyncs the painted state
    // from React's (the browser un-toggles after React has already restored it).
    if (isReadOnly) return;
    if (isGroupMember) group.selectValue(String(value));
    else setLocalChecked(e.target.checked);
    onChangeProp?.(e);
  };

  const sz = radioSizes[size];
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
        ref={ref}
        type="radio"
        id={id}
        name={name}
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
        className={astralisMerge(sz.circle, radioControl, radioControlColor(isChecked, !!isInvalid))}
      >
        {isChecked && (
          <span aria-hidden="true" className={astralisMerge(sz.dot, "astralis:rounded-full astralis:bg-accent-contrast")} />
        )}
      </span>

      {children && (
        <span className={astralisMerge(sz.label, "astralis:text-label-base astralis:select-none")}>
          {children}
        </span>
      )}
    </label>
  );
});
