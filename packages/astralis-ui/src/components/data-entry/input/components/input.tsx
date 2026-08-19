"use client";

import { splitPlacement } from "../../../../utils/placement";
import type { Ref } from "react";
import { useFieldContext } from "../../field/field.context";
import { inputVariants } from "../input.styles";
import type { InputProps } from "../input.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function InputBase({
  size = "md",
  variant = "outline",
  invalid: invalidProp,
  disabled: disabledProp,
  readOnly: readOnlyProp,
  className = "",
  id: idProp,
  ref,
  ...props
}: InputProps & { ref?: Ref<HTMLInputElement> }) {
    const field = useFieldContext();

    const isInvalid = invalidProp ?? field?.invalid;
    const isDisabled = disabledProp ?? field?.disabled;
    const isReadOnly = readOnlyProp ?? field?.readOnly;
    const isRequired = field?.required;
    const id = idProp ?? field?.id;

    const { placementClass, rest: domProps } = splitPlacement(props);


    return (
      <input
        ref={ref}
        id={id}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        aria-required={isRequired || undefined}
        aria-readonly={isReadOnly || undefined}
        className={astralisMerge(
          inputVariants({ size, variant, invalid: !!isInvalid }),
          // Slot padding keys off the InputGroup wrapper's presence attributes.
          "astralis:[[data-inputgroup-prefix]_&]:pl-9 astralis:[[data-inputgroup-suffix]_&]:pr-9",
          placementClass, className,
        )}
        {...domProps}
      />
    );
}

InputBase.displayName = "Input";
