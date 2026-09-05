import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";
import type { ColorScheme } from "../../../const/color-schemes";

export type EditableSize = "sm" | "md" | "lg";

export interface EditableProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "onSubmit" | "defaultValue">, PlacementProps {
  /** Controlled text value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Fires with the new value when a changed edit is committed (Enter / blur). */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: string) => void;
  /** Fires when an edit is committed (Enter / blur) */
  onSubmit?: (value: string) => void;
  /** Fires when an edit is cancelled (Escape) */
  onCancel?: () => void;
  /** Shown by the preview when the value is empty. @default "Click to edit" */
  placeholder?: string;
  /** Text scale shared by preview and input. @default "md" */
  size?: EditableSize;
  /** Locks editing — the preview stays a plain text span. Inherited from `Field`, as is its `readOnly`. */
  disabled?: boolean;
  /** Marks the input as invalid. Inherited from `Field`. */
  invalid?: boolean;
  /** Hue of the focus ring (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  /** Start in edit mode */
  startWithEditView?: boolean;
  /** Commit on blur (otherwise blur cancels). @default true */
  submitOnBlur?: boolean;
  children: ReactNode;
}

export type EditablePreviewProps = ComponentPropsWithoutRef<"span">;
export type EditableInputProps = Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "size">;

/** @deprecated Internal context shape; it will stop being exported in the next minor. */
export interface EditableContextValue {
  value: string;
  draft: string;
  editing: boolean;
  disabled?: boolean;
  invalid?: boolean;
  placeholder: string;
  size: EditableSize;
  submitOnBlur: boolean;
  start: () => void;
  commit: () => void;
  cancel: () => void;
  setDraft: (value: string) => void;
}
