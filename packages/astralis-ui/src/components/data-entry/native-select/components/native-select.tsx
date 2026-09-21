"use client";

import { splitPlacement } from "../../../../utils/placement";
import type { Ref } from "react";
import { useFieldContext } from "../../field/field.context";
import type { NativeSelectProps } from "../native-select.types";
import { nativeSelectField, nativeSelectChevron, nativeSelectChevronGutter } from "../native-select.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { ChevronDownIcon } from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

/**
 * A styled native `<select>` — the platform's own dropdown, keyboard handling
 * and mobile pickers, wearing Input's chrome. Reach for `Select` when options
 * need custom rendering; reach for this when they don't.
 */
export const NativeSelect = identify("NativeSelect", function NativeSelect({
  size = "md",
  variant = "outline",
  colorScheme,
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
      className={astralisMerge(
        "astralis:relative astralis:inline-flex astralis:items-center astralis:w-full",
        colorScheme && accentClass(colorScheme),
        placementClass,
        className,
      )}
      style={placementStyle}
    >
      <select
        ref={ref}
        id={id}
        disabled={isDisabled}
        required={field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        // The placeholder is an empty-valued disabled option, so it shows
        // until a choice is made but can never be re-selected.
        defaultValue={placeholder && defaultValue === undefined && props.value === undefined ? "" : defaultValue}
        className={astralisMerge(nativeSelectField({ size, variant, invalid: !!isInvalid }), nativeSelectChevronGutter)}
        {...domProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className={nativeSelectChevron}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
    </span>
  );
});
