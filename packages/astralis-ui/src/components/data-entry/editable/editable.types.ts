import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type EditableSize = "sm" | "md" | "lg";

export interface EditableProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "onSubmit" | "defaultValue"> {
  /** Controlled text value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Fires on every keystroke while editing */
  onChange?: (value: string) => void;
  /** Fires when an edit is committed (Enter / blur) */
  onSubmit?: (value: string) => void;
  /** Fires when an edit is cancelled (Escape) */
  onCancel?: () => void;
  /** Shown by the preview when the value is empty. @default "Click to edit" */
  placeholder?: string;
  /** Text scale shared by preview and input. @default "md" */
  size?: EditableSize;
  /** Locks editing — the preview stays a plain text span */
  disabled?: boolean;
  /** Start in edit mode */
  startWithEditView?: boolean;
  /** Commit on blur (otherwise blur cancels). @default true */
  submitOnBlur?: boolean;
  children: ReactNode;
}

export type EditablePreviewProps = ComponentPropsWithoutRef<"span">;
export type EditableInputProps = Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "size">;

export interface EditableContextValue {
  value: string;
  draft: string;
  editing: boolean;
  disabled?: boolean;
  placeholder: string;
  size: EditableSize;
  submitOnBlur: boolean;
  start: () => void;
  commit: () => void;
  cancel: () => void;
  setDraft: (value: string) => void;
}
