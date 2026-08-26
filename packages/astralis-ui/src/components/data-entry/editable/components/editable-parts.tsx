"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { useEditableContext } from "../editable.context";
import type { EditablePreviewProps, EditableInputProps } from "../editable.types";
import { editablePreview, editablePreviewEmpty, editableInput } from "../editable.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/** The resting state: shows the value (or placeholder) and enters edit mode
 *  on click or Enter/Space — it is a real button in the accessibility tree. */
export function EditablePreview({ className = "", onClick, ...rest }: EditablePreviewProps) {
  const { value, editing, disabled, placeholder, start } = useEditableContext();
  if (editing) return null;

  return (
    <span
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onClick={(e) => {
        onClick?.(e);
        start();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
      }}
      className={astralisMerge(
        editablePreview,
        !value && editablePreviewEmpty,
        disabled && "astralis:cursor-default astralis:hover:bg-transparent",
        className,
      )}
      {...rest}
    >
      {value || placeholder}
    </span>
  );
}

EditablePreview.displayName = "Editable.Preview";

/** The editing state: auto-focused and text-selected on entry; Enter commits,
 *  Escape cancels, blur follows `submitOnBlur`. */
export function EditableInput({ className = "", onKeyDown, onBlur, ...rest }: EditableInputProps) {
  const { draft, editing, submitOnBlur, commit, cancel, setDraft } = useEditableContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!editing) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  };

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        onBlur?.(e);
        if (submitOnBlur) commit();
        else cancel();
      }}
      className={astralisMerge(editableInput, className)}
      {...rest}
    />
  );
}

EditableInput.displayName = "Editable.Input";
