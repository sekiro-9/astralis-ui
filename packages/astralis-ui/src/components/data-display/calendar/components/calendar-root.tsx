"use client";

import { useMemo, useState, type Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { CalendarContext } from "../calendar.context";
import type { CalendarRangeValue, CalendarRootProps, CalendarValue } from "../calendar.types";
import { isSameDay, startOfDay, startOfMonth } from "../calendar.utils";
import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { CalendarNextTrigger } from "./calendar-next-trigger";
import { CalendarPrevTrigger } from "./calendar-prev-trigger";
import { CalendarViewTrigger } from "./calendar-view-trigger";
import { CalendarWeekdays } from "./calendar-weekdays";
import { identify } from "../../../../utils/dev-identity";

const SIZE_MAP = {
  sm: "astralis:text-xs",
  md: "astralis:text-sm",
  lg: "astralis:text-base",
} as const;

function isRangeValue(value: CalendarValue): value is CalendarRangeValue {
  return !!value && !Array.isArray(value) && !(value instanceof Date);
}

function normalizeValue(value: CalendarValue, selectionMode: CalendarRootProps["selectionMode"]) {
  if (selectionMode === "single") {
    return value instanceof Date ? startOfDay(value) : null;
  }
  if (selectionMode === "multiple") {
    return Array.isArray(value) ? value.map(startOfDay) : [];
  }
  if (isRangeValue(value)) {
    return {
      start: value.start ? startOfDay(value.start) : null,
      end: value.end ? startOfDay(value.end) : null,
    };
  }
  return { start: null, end: null };
}

export const CalendarRoot = identify("Calendar", function CalendarRoot({
  selectionMode = "single",
  value,
  defaultValue,
  onValueChange,
  defaultMonth,
  locale = "en-US",
  firstDayOfWeek = 0,
  showOutsideDays = true,
  minDate,
  maxDate,
  isDateUnavailable,
  size = "md",
  colorScheme = "brand",
  className,
  children,
  ref,
  ...props
}: CalendarRootProps & { ref?: Ref<HTMLDivElement> }) {
  // `style` stays in props: splitPlacement folds channel vars under it and
  // it arrives via the domProps spread (user keys win).
  const { placementClass, rest: domProps } = splitPlacement(props);

  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(defaultMonth ?? new Date()));
  const [rawValue, setValue] = useControllableState<CalendarValue>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });

  const selectedValue = useMemo(() => normalizeValue(rawValue, selectionMode), [rawValue, selectionMode]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth),
    [locale, visibleMonth],
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    [locale],
  );

  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;

  const isDateDisabled = (date: Date) => {
    const normalized = startOfDay(date);
    if (min && normalized < min) return true;
    if (max && normalized > max) return true;
    return isDateUnavailable ? isDateUnavailable(normalized) : false;
  };

  const selectDate = (date: Date) => {
    const normalized = startOfDay(date);
    if (isDateDisabled(normalized)) return;

    if (selectionMode === "single") {
      setValue(normalized);
      return;
    }

    if (selectionMode === "multiple") {
      const current = Array.isArray(selectedValue) ? selectedValue : [];
      const hasDate = current.some((item) => isSameDay(item, normalized));
      setValue(hasDate ? current.filter((item) => !isSameDay(item, normalized)) : [...current, normalized]);
      return;
    }

    const current = isRangeValue(selectedValue) ? selectedValue : { start: null, end: null };
    if (!current.start || current.end) {
      setValue({ start: normalized, end: null });
    } else if (normalized < current.start) {
      setValue({ start: normalized, end: current.start });
    } else {
      setValue({ start: current.start, end: normalized });
    }
  };

  const isDateSelected = (date: Date) => {
    if (selectedValue instanceof Date) return isSameDay(selectedValue, date);
    if (Array.isArray(selectedValue)) return selectedValue.some((item) => isSameDay(item, date));
    if (isRangeValue(selectedValue)) {
      return (
        (!!selectedValue.start && isSameDay(selectedValue.start, date)) ||
        (!!selectedValue.end && isSameDay(selectedValue.end, date))
      );
    }
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!isRangeValue(selectedValue) || !selectedValue.start || !selectedValue.end) return false;
    const day = startOfDay(date);
    return day > selectedValue.start && day < selectedValue.end;
  };

  const contextValue = {
    visibleMonth,
    setVisibleMonth,
    monthLabel,
    dayLabel: (date: Date) => dayFormatter.format(date),
    selectionMode,
    selectedValue,
    selectDate,
    isDateSelected,
    isDateInRange,
    isDateDisabled,
    isOutsideMonth: (date: Date) => date.getMonth() !== visibleMonth.getMonth(),
    showOutsideDays,
    firstDayOfWeek,
    locale,
    size,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={astralisMerge(
          "astralis:inline-flex astralis:flex-col astralis:gap-3 astralis:rounded-xl astralis:border-normal astralis:border-stroke-base astralis:bg-surface-base astralis:p-3",
          SIZE_MAP[size],
          accentClass(colorScheme),
          placementClass,
          className,
        )}
        {...domProps}
      >
        {children ?? (
          <>
            <CalendarHeader>
              <CalendarPrevTrigger />
              <CalendarViewTrigger />
              <CalendarNextTrigger />
            </CalendarHeader>
            <CalendarWeekdays />
            <CalendarGrid />
          </>
        )}
      </div>
    </CalendarContext.Provider>
  );
});
