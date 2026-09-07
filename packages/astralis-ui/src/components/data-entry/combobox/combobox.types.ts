import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { InputSize, InputVariant } from "../input/input.types";

export interface ComboboxOptionItem {
  label: string;
  value: string | number;
  /** Text the filter matches against, when it should differ from the label. */
  searchLabel?: string;
  disabled?: boolean;
}

export interface ComboboxOptionGroup {
  group: string;
  options: ComboboxOptionItem[];
}

export type ComboboxOptionOrGroup = ComboboxOptionItem | ComboboxOptionGroup;

export interface ComboboxProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue">, PlacementProps {
  options?: ComboboxOptionOrGroup[];
  /** Controlled selected value; `null` = nothing selected. */
  value?: string | number | null;
  defaultValue?: string | number | null;
  /** Fires when a selection commits (pick or clear). */
  onValueChange?: (value: string | number | null) => void;
  /** @deprecated Use `onValueChange`. Still called, after `onValueChange`. */
  onChange?: (value: string | number | null) => void;
  /** Fires on every keystroke in the filter text. */
  onInputChange?: (text: string) => void;
  placeholder?: string;
  size?: InputSize;
  variant?: InputVariant;
  /** Hue for focus ring and active option (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  /** Show a clear button when a value is selected. */
  clearable?: boolean;
  /**
   * Let typed text that matches no option commit as the value — the options
   * become suggestions rather than a closed set. Enter (with nothing
   * highlighted), Tab, and clicking away commit the text; Escape still
   * reverts. Text exactly matching an option's label commits that option.
   */
  allowCustomValue?: boolean;
  loading?: boolean;
  /** Text shown when nothing matches the filter. */
  emptyText?: string;
  /** Form field name — renders a hidden input for native submission. */
  name?: string;
  className?: string;
  id?: string;
}
