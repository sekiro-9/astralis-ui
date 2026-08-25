import type { ComponentPropsWithoutRef, InputHTMLAttributes, ReactNode } from "react";

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  /** Controlled selected value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Name attribute applied to all segment inputs (defaults to a generated id) */
  name?: string;
  /** Visual size of every segment. @default "md" */
  size?: SegmentedControlSize;
  /** Disables the whole control */
  disabled?: boolean;
  /** Stretch to fill the container, segments sharing the width equally */
  fullWidth?: boolean;
  children: ReactNode;
}

export interface SegmentedControlItemProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "children"
> {
  /** The value this segment represents within the group */
  value: string;
  /** Segment label */
  children: ReactNode;
}

export interface SegmentedControlContextValue {
  groupValue: string;
  selectValue: (val: string) => void;
  name: string;
  size: SegmentedControlSize;
  disabled?: boolean;
  fullWidth?: boolean;
}
