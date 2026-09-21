"use client";

import { useEffect, type Ref } from "react";
import { useFieldContext } from "../field.context";
import type { FieldLabelProps } from "../field.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const FieldLabel = identify("Field.Label", function FieldLabel({
  children,
  className = "",
  id: idProp,
  ref,
  ...props
}: FieldLabelProps & { ref?: Ref<HTMLLabelElement> }) {
  const field = useFieldContext();
  const id = idProp ?? field?.labelId;
  const setLabelledBy = field?.setLabelledBy;

  useEffect(() => {
    if (!setLabelledBy) return;
    setLabelledBy(id);
    return () => setLabelledBy(undefined);
  }, [setLabelledBy, id]);

  return (
    <label
      ref={ref}
      id={id}
      htmlFor={field?.id}
      data-invalid={field?.invalid ? "" : undefined}
      data-disabled={field?.disabled ? "" : undefined}
      className={astralisMerge(
        "astralis:text-sm astralis:font-medium astralis:select-none",
        field?.disabled ? "astralis:text-label-subtle" : "astralis:text-label-base",
        className,
      )}
      {...props}
    >
      {children}
      {field?.required && (
        <span aria-hidden="true" className="astralis:ml-0.5 astralis:text-error-label">
          *
        </span>
      )}
    </label>
  );
});
