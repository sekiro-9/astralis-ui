"use client";

import { createContext, useContext } from "react";
import type {
  CalendarSelectionMode,
  CalendarSize,
  CalendarValue,
} from "./calendar.types";

export interface CalendarContextValue {
  visibleMonth: Date;
  setVisibleMonth: (date: Date) => void;
  monthLabel: string;
  /** The locale-formatted accessible name of a day. */
  dayLabel: (date: Date) => string;
  selectionMode: CalendarSelectionMode;
  selectedValue: CalendarValue;
  selectDate: (date: Date) => void;
  isDateSelected: (date: Date) => boolean;
  isDateInRange: (date: Date) => boolean;
  isDateDisabled: (date: Date) => boolean;
  isOutsideMonth: (date: Date) => boolean;
  showOutsideDays: boolean;
  firstDayOfWeek: number;
  locale: string;
  size: CalendarSize;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendarContext() {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("Calendar components must be used inside <Calendar>");
  }

  return context;
}
