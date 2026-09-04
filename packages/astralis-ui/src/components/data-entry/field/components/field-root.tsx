"use client";

import { splitPlacement } from "../../../../utils/placement";
import { useId, useMemo, useState } from "react";
import FieldContext from "../field.context";
import type { FieldRootProps } from "../field.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * Groups a control with its label, help text, and error text — sharing state
 * (id, invalid, disabled, required, readOnly) with descendants via context.
 */
export function FieldRoot({
  children,
  invalid,
  disabled,
  required,
  readOnly,
  id: userProvidedId,
  className = "",
  ...props
}: FieldRootProps) {
  const generatedId = useId();
  const id = userProvidedId ?? generatedId;

  // The parts report their presence so controls only point aria-labelledby
  // and aria-describedby at ids that actually exist in the DOM.
  const [labelledBy, setLabelledBy] = useState<string | undefined>(undefined);
  const [hasHelpText, setHasHelpText] = useState(false);
  const [hasErrorText, setHasErrorText] = useState(false);
  const labelId = `${id}-label`;
  const helpTextId = `${id}-help`;
  const errorTextId = `${id}-error`;

  const ctx = useMemo(() => {
    const describedBy =
      [hasErrorText ? errorTextId : null, hasHelpText ? helpTextId : null]
        .filter(Boolean)
        .join(" ") || undefined;
    return {
      id, invalid, disabled, required, readOnly,
      labelId, labelledBy, helpTextId, errorTextId, describedBy,
      setLabelledBy, setHasHelpText, setHasErrorText,
    };
  }, [id, invalid, disabled, required, readOnly, labelId, labelledBy, helpTextId, errorTextId, hasHelpText, hasErrorText]);

  const { placementClass, rest: domProps } = splitPlacement(props);

  return (
    <FieldContext.Provider value={ctx}>
      <div
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={astralisMerge("astralis:flex astralis:flex-col astralis:gap-1.5", placementClass, className)}
        {...domProps}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

FieldRoot.displayName = "Field";
