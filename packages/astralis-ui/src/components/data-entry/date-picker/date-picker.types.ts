import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef } from "react";
import type { InputRounded, InputSize, InputVariant } from "../input/input.types";
import type { ColorScheme } from "../../../const/color-schemes";
import type { CalendarRangeValue } from "../../data-display/calendar";
import type { Side, Align } from "../../../hooks/use-anchor-position";

export type DatePickerSelectionMode = "single" | "range";

/** A date in `single` mode, a `{ start, end }` pair in `range` mode; `null` is empty. */
export type DatePickerValue = Date | CalendarRangeValue | null;

export interface DatePickerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "value" | "defaultValue" | "onChange" | "children" | "type" | "name">, PlacementProps {
  /** Pick one date, or a start and an end. @default "single" */
  selectionMode?: DatePickerSelectionMode;
  /** Controlled value; `null` is a controlled empty value. */
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  onValueChange?: (value: DatePickerValue) => void;
  /** Shown while nothing is picked. @default "Pick a date" */
  placeholder?: string;
  /** Locale for the shown date and the calendar. @default "en-US" */
  locale?: string;
  /** How the picked date is written. @default { dateStyle: "medium" } */
  formatOptions?: Intl.DateTimeFormatOptions;
  minDate?: Date;
  maxDate?: Date;
  isDateUnavailable?: (date: Date) => boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Month the calendar opens on when nothing is picked. */
  defaultMonth?: Date;
  size?: InputSize;
  variant?: InputVariant;
  /** Corner radius, on Input's scale; `full` makes a pill. Unset, the variant
   *  decides: `lg` on outline and filled, square on underline and unstyled.
   *  @default "lg" */
  rounded?: InputRounded;
  /** Hue of the focus ring and the selected day (via the accent channel). Inherits the surrounding scheme, brand by default. */
  colorScheme?: ColorScheme;
  invalid?: boolean;
  /** Offer a Clear button in the calendar once a date is picked. @default true */
  clearable?: boolean;
  /** Submit the value with a form: `2026-11-19`, or `2026-11-19/2026-11-25` for a range. */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Side of the field the calendar opens on. @default "bottom" */
  side?: Side;
  /** @default "start" */
  align?: Align;
}
