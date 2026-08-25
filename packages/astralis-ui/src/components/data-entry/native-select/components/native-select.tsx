"use client";

import { splitPlacement } from "../../../../utils/placement";
import type { Ref } from "react";
import { useFieldContext } from "../../field/field.context";
import type { NativeSelectProps } from "../native-select.types";
import { nativeSelectField, nativeSelectChevron } from "../native-select.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { ChevronDownIcon } from "../../../icon/internal-icons";

/**
 * A styled native `<select>` — the platform's own dropdown, keyboard handling
 * and mobile pickers, wearing Input's chrome. Reach for `Select` when options
 * need custom rendering; reach for this when they don't.
 */
export function NativeSelect({
  size = "md",
  variant = "outline",
  invalid: invalidProp,
  disabled: disabledProp,
  placeholder,
  defaultValue,
  children,
  className = "",
  id: idProp,
  ref,
  ...props
}: NativeSelectProps & { ref?: Ref<HTMLSelectElement> }) {
  const field = useFieldContext();

  const isDisabled = disabledProp ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const id = idProp ?? field?.id;

  const { placementClass, placementStyle, rest: domProps } = splitPlacement(props);

  return (
    <span
      className={astralisMerge("astralis:relative astralis:inline-flex astralis:w-full", placementClass, className)}
      style={placementStyle}
    >
      <select
        ref={ref}
        id={id}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        // The placeholder is an empty-valued disabled option, so it shows
        // until a choice is made but can never be re-selected.
        defaultValue={placeholder && defaultValue === undefined && props.value === undefined ? "" : defaultValue}
        className={nativeSelectField({ size, variant, invalid: !!isInvalid })}
        {...domProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDownIcon aria-hidden="true" className={nativeSelectChevron} />
    </span>
  );
}

NativeSelect.displayName = "NativeSelect";
