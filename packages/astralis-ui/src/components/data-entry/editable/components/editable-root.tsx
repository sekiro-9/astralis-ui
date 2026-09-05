"use client";

import { useCallback, useMemo, useState } from "react";
import EditableContext from "../editable.context";
import type { EditableProps } from "../editable.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import { splitPlacement } from "../../../../utils/placement";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { editableSizes } from "../editable.styles";

/**
 * Click-to-edit text: a preview span that swaps for an input on click,
 * committing on Enter/blur and cancelling on Escape. For titles, names and
 * inline fields where a permanent input would be visual noise.
 */
export function EditableRoot({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Click to edit",
  size = "md",
  colorScheme,
  disabled: disabledProp,
  invalid: invalidProp,
  startWithEditView = false,
  submitOnBlur = true,
  children,
  className = "",
  ...rest
}: EditableProps) {
  const field = useFieldContext();
  const disabled = disabledProp ?? (field?.disabled || field?.readOnly);
  const invalid = invalidProp ?? field?.invalid;

  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: (next: string) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });
  const [editing, setEditing] = useState(startWithEditView && !disabled);
  const [draft, setDraft] = useState(value);

  const start = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
  }, [disabled, value]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) setValue(draft);
    onSubmit?.(draft);
  }, [draft, value, setValue, onSubmit]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
    onCancel?.();
  }, [value, onCancel]);

  const ctx = useMemo(
    () => ({ value, draft, editing, disabled, invalid, placeholder, size, submitOnBlur, start, commit, cancel, setDraft }),
    [value, draft, editing, disabled, invalid, placeholder, size, submitOnBlur, start, commit, cancel],
  );

  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <EditableContext.Provider value={ctx}>
      <div
        className={astralisMerge(editableSizes[size], colorScheme && accentClass(colorScheme), placementClass, className)}
        {...domProps}
      >
        {children}
      </div>
    </EditableContext.Provider>
  );
}

EditableRoot.displayName = "Editable";
