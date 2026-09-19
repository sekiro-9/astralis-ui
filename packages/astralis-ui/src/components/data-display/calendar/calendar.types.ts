import type { PlacementProps } from "../../../utils/placement";
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type CalendarSize = "sm" | "md" | "lg";
export type CalendarSelectionMode = "single" | "multiple" | "range";

export type CalendarRangeValue = {
  start: Date | null;
  end: Date | null;
};

export type CalendarValue = Date | Date[] | CalendarRangeValue | null;

export interface CalendarRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">, PlacementProps {
  selectionMode?: CalendarSelectionMode;
  /** Controlled selection; `null` is a controlled empty selection. */
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onValueChange?: (value: CalendarValue) => void;
  defaultMonth?: Date;
  /** Locale for the month title, weekday names and each day's accessible name. @default "en-US" */
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showOutsideDays?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isDateUnavailable?: (date: Date) => boolean;
  size?: CalendarSize;
  /** Hue of the selected day and range (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type CalendarHeaderProps = HTMLAttributes<HTMLDivElement>;

export type CalendarTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export type CalendarWeekdaysProps = HTMLAttributes<HTMLDivElement>;

export type CalendarGridProps = HTMLAttributes<HTMLDivElement>;

export interface CalendarCellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date;
}
