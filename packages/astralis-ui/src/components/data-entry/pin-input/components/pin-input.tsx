"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, ClipboardEvent, FocusEvent, KeyboardEvent } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import { pinCell } from "../pin-input.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import type { PinInputProps, PinInputType } from "../pin-input.types";
import { identify } from "../../../../utils/dev-identity";

function splitToChars(value: string, length: number): string[] {
  return Array.from({ length }, (_, i) => value[i] ?? "");
}

function keepAllowed(raw: string, type: PinInputType): string {
  if (type === "numeric") return raw.replace(/\D/g, "");
  if (type === "alpha") return raw.replace(/[^a-zA-Z]/g, "");
  return raw.replace(/\s/g, "");
}

export const PinInputBase = identify("PinInput", function PinInputBase({
  length = 4,
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  onComplete,
  type = "numeric",
  mask = false,
  size = "md",
  variant = "outline",
  colorScheme,
  disabled: disabledProp,
  invalid: invalidProp,
  readOnly: readOnlyProp,
  placeholder = "○",
  autoFocus = false,
  className = "",
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: PinInputProps) {
  const { placementClass, rest: domRest } = splitPlacement(rest);

  const field = useFieldContext();
  const isDisabled = disabledProp ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const isReadOnly = readOnlyProp ?? field?.readOnly;
  const id = idProp ?? field?.id;
  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelledBy);

  // Uncontrolled state is kept per cell so a cleared middle cell stays a gap.
  const [chars, setChars] = useControllableState<string[]>({
    value: value === undefined ? undefined : splitToChars(value, length),
    defaultValue: splitToChars(defaultValue, length),
  });

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const focusCell = (i: number) => inputRefs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  const updateChars = (next: string[]) => {
    setChars(next);
    const combined = next.join("");
    onValueChange?.(combined);
    onChange?.(combined);
    if (next.every((c) => c !== "")) onComplete?.(combined);
  };

  // A paste or a one-time-code autofill replaces the whole code.
  const distribute = (raw: string) => {
    const filtered = keepAllowed(raw, type).slice(0, length);
    if (!filtered) return;
    updateChars(splitToChars(filtered, length));
    focusCell(filtered.length);
  };

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const incoming = e.target.value;
    const previous = chars[i];
    // Typing over a filled cell whose text is not selected yields "old+new".
    const entry =
      previous && incoming.length === 2 && incoming.includes(previous)
        ? incoming.replace(previous, "")
        : incoming;

    if (entry.length > 1) {
      distribute(entry);
      return;
    }
    if (entry && !keepAllowed(entry, type)) return;

    const next = [...chars];
    next[i] = entry;
    updateChars(next);
    if (entry && i < length - 1) focusCell(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      if (e.key === "Backspace" || e.key === "Delete") e.preventDefault();
      return;
    }
    switch (e.key) {
      case "Backspace": {
        e.preventDefault();
        const target = chars[i] ? i : i - 1;
        if (target < 0) break;
        const next = [...chars];
        next[target] = "";
        updateChars(next);
        focusCell(target);
        break;
      }
      case "Delete":
        if (chars[i]) {
          e.preventDefault();
          const next = [...chars];
          next[i] = "";
          updateChars(next);
        }
        break;
      case "ArrowLeft":
        if (i > 0) {
          e.preventDefault();
          focusCell(i - 1);
        }
        break;
      case "ArrowRight":
        if (i < length - 1) {
          e.preventDefault();
          focusCell(i + 1);
        }
        break;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!isReadOnly) distribute(e.clipboardData.getData("text"));
  };

  // Typing then replaces the cell's character instead of appending to it.
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => e.target.select();

  const inputType = mask ? "password" : type === "numeric" ? "tel" : "text";

  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : (ariaLabel ?? "PIN input")}
      aria-labelledby={labelledBy}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:gap-2",
        colorScheme && accentClass(colorScheme),
        placementClass,
        className,
      )}
      {...domRest}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          id={i === 0 ? id : undefined}
          type={inputType}
          inputMode={type === "numeric" ? "numeric" : "text"}
          // The OS offers a received code to the first cell only; it arrives
          // as one multi-character change and is spread across the cells.
          autoComplete={i === 0 ? "one-time-code" : "off"}
          value={chars[i]}
          placeholder={placeholder}
          disabled={!!isDisabled}
          readOnly={isReadOnly}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          aria-readonly={isReadOnly || undefined}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={astralisMerge(
            pinCell({ size, variant, invalid: !!isInvalid }),
            isReadOnly && "astralis:bg-surface-muted astralis:cursor-default",
          )}
        />
      ))}
    </div>
  );
});
