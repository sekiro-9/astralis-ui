import type { CalendarRangeValue } from "../../data-display/calendar";
import type { DatePickerValue } from "./date-picker.types";

export const isRange = (value: DatePickerValue): value is CalendarRangeValue =>
  value !== null && !(value instanceof Date);

/** Local calendar date as `YYYY-MM-DD`: what a form submits, free of time zones. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The form value: one ISO date, or `start/end` for a range; empty until complete. */
export function toFormValue(value: DatePickerValue): string {
  if (value === null) return "";
  if (!isRange(value)) return toIsoDate(value);
  return value.start && value.end ? `${toIsoDate(value.start)}/${toIsoDate(value.end)}` : "";
}

/** The text in the field, or `null` when nothing is picked. */
export function formatValue(value: DatePickerValue, locale: string, options: Intl.DateTimeFormatOptions): string | null {
  if (value === null) return null;
  const format = new Intl.DateTimeFormat(locale, options);
  if (!isRange(value)) return format.format(value);
  if (!value.start) return null;
  return value.end ? `${format.format(value.start)} – ${format.format(value.end)}` : `${format.format(value.start)} – …`;
}
