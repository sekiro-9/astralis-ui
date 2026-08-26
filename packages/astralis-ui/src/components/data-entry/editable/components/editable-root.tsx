"use client";

import { useCallback, useMemo, useState } from "react";
import EditableContext from "../editable.context";
import type { EditableProps } from "../editable.types";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { editableSizes } from "../editable.styles";

/**
 * Click-to-edit text: a preview span that swaps for an input on click,
 * committing on Enter/blur and cancelling on Escape. For titles, names and
 * inline fields where a permanent input would be visual noise.
 */
export function EditableRoot({
  value: valueProp,
  defaultValue = "",
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Click to edit",
  size = "md",
  disabled,
  startWithEditView = false,
  submitOnBlur = true,
  children,
  className = "",
  ...rest
}: EditableProps) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange });
  const [editing, setEditing] = useState(startWithEditView && !disabled);
  const [draft, setDraft] = useState(value);

  const start = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
  }, [disabled, value]);

  const commit = useCallback(() => {
    setEditing(false);
    setValue(draft);
    onSubmit?.(draft);
  }, [draft, setValue, onSubmit]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
    onCancel?.();
  }, [value, onCancel]);

  const ctx = useMemo(
    () => ({ value, draft, editing, disabled, placeholder, size, submitOnBlur, start, commit, cancel, setDraft }),
    [value, draft, editing, disabled, placeholder, size, submitOnBlur, start, commit, cancel],
  );

  return (
    <EditableContext.Provider value={ctx}>
      <div className={astralisMerge(editableSizes[size], className)} {...rest}>
        {children}
      </div>
    </EditableContext.Provider>
  );
}

EditableRoot.displayName = "Editable";
