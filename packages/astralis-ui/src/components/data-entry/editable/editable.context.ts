"use client";

import { createContext, useContext } from "react";
import type { EditableContextValue } from "./editable.types";

const EditableContext = createContext<EditableContextValue | null>(null);

export function useEditableContext(): EditableContextValue {
  const ctx = useContext(EditableContext);
  if (!ctx) throw new Error("Editable sub-components must be used within <Editable>");
  return ctx;
}

export default EditableContext;
