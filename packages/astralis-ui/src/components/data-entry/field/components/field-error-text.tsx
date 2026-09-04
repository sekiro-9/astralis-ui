"use client";

import { useEffect, type Ref } from "react";
import type { FieldErrorTextProps } from "../field.types";
import { useFieldContext } from "../field.context";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { CircleAlertIcon } from "../../../icon/internal-icons";

export function FieldErrorText({
  children,
  className = "",
  ref,
  ...props
}: FieldErrorTextProps & { ref?: Ref<HTMLParagraphElement> }) {
  const field = useFieldContext();

  // Announce presence so the field's input gains aria-describedby → this id.
  useEffect(() => {
    if (!field) return;
    field.setHasErrorText(true);
    return () => field.setHasErrorText(false);
  }, [field]);

  return (
    <p
      ref={ref}
      id={field?.errorTextId}
      role="alert"
      aria-live="polite"
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:gap-1 astralis:text-xs astralis:text-error-label",
        className,
      )}
      {...props}
    >
      <CircleAlertIcon aria-hidden="true" className="astralis:h-3.5 astralis:w-3.5 astralis:shrink-0" />
      {children}
    </p>
  );
}

FieldErrorText.displayName = "Field.ErrorText";
