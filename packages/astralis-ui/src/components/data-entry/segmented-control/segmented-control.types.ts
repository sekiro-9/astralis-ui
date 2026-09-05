import type { ComponentPropsWithoutRef, InputHTMLAttributes, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";
import type { ColorScheme } from "../../../const/color-schemes";

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue">, PlacementProps {
  /** Controlled selected value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Fires with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. Still fires, with the same value. */
  onChange?: (value: string) => void;
  /** Name attribute applied to all segment inputs (defaults to a generated id) */
  name?: string;
  /** Visual size of every segment. @default "md" */
  size?: SegmentedControlSize;
  /** Hue of the focus ring and the selected label (via the accent channel). Unset keeps the neutral look. */
  colorScheme?: ColorScheme;
  /** Disables the whole control. Inherited from `Field`. */
  disabled?: boolean;
  /** Marks the control as invalid. Inherited from `Field`. */
  invalid?: boolean;
  /** Stretch to fill the container, segments sharing the width equally */
  fullWidth?: boolean;
  children: ReactNode;
}

/** `className` and `style` style the visible segment; every other prop lands on the native radio. */
export interface SegmentedControlItemProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "children"
> {
  /** The value this segment represents within the group */
  value: string;
  /** Segment label */
  children: ReactNode;
}

/** @deprecated Internal context shape; it will stop being exported in the next minor. */
export interface SegmentedControlContextValue {
  groupValue: string;
  selectValue: (val: string) => void;
  name: string;
  size: SegmentedControlSize;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Whether a `colorScheme` was chosen, so the selected label takes the accent. */
  accented?: boolean;
}
