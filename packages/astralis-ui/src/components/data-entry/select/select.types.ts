import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { PlacementProps } from "../../../utils/placement";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "filled" | "underline" | "unstyled";

export interface SelectOptionItem {
  value: string | number;
  label: ReactNode;
  /** Plain text the search matches against. Defaults to the label's text. */
  searchLabel?: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOptionItem[];
}

export type SelectOptionOrGroup = SelectOptionItem | SelectOptionGroup;

/**
 * Extends the trigger's own button props, so `aria-label` and friends reach
 * the `role="combobox"` element. PlacementProps, `className` and the form
 * bridge land on the wrapper: the parent decides how wide the control is, the
 * recipe decides how it looks.
 */
export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<"button">,
      | "value"
      | "defaultValue"
      | "onChange"
      | "size"
      | "disabled"
      | "id"
      | "className"
      | "name"
      | "placeholder"
      | "children"
    >,
    PlacementProps {
  /** List of options or option groups */
  options?: SelectOptionOrGroup[];
  /** Controlled selected value */
  value?: string | number | null;
  /** Uncontrolled default value */
  defaultValue?: string | number | null;
  /** Called when the selection changes; receives `null` when cleared */
  onValueChange?: (value: string | number | null) => void;
  /** @deprecated Use `onValueChange`. Still called, after `onValueChange`. */
  onChange?: (value: string | number | null) => void;
  /** Called when selection is explicitly cleared */
  onClear?: () => void;
  placeholder?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  /** Hue for focus ring and selected-option highlight (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  disabled?: boolean;
  invalid?: boolean;
  /** Marks the select as read-only */
  readOnly?: boolean;
  /** Show a clear button when a value is selected */
  clearable?: boolean;
  /** Show search input inside the dropdown */
  searchable?: boolean;
  /** Shows a loading spinner instead of the chevron */
  loading?: boolean;
  /** Text shown when no options match */
  emptyText?: string;
  /**
   * Form field name. When set, a hidden input carrying the selected value is
   * rendered so the Select participates in native <form> submission.
   */
  name?: string;
  className?: string;
  id?: string;
}
