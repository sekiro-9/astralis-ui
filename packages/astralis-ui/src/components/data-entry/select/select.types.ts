import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { PlacementProps } from "../../../utils/placement";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "filled";

export interface SelectOptionItem {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOptionItem[];
}

export type SelectOptionOrGroup = SelectOptionItem | SelectOptionGroup;

/**
 * Extends the trigger's own button props so anything a caller passes — most
 * importantly `aria-label` — actually reaches the `role="combobox"` element.
 * Previously every prop was destructured explicitly with no rest, so a label
 * passed from outside was silently dropped and the only way to name a Select
 * was a Field wrapper.
 *
 * PlacementProps land on the wrapper: the parent decides how wide the control
 * is, the recipe decides how it looks.
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
  /** Called when selection changes; receives `null` when cleared */
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
