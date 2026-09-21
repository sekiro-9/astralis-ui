"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { useCalendarContext } from "../calendar.context";
import type { CalendarGridProps } from "../calendar.types";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { addDays, addMonthsClamped, dateKey, isSameDay, isToday, nearestEnabled, startOfMonth } from "../calendar.utils";
import { CalendarCell } from "./calendar-cell";
import { identify } from "../../../../utils/dev-identity";

/**
 * The month as an ARIA grid: six rows of seven gridcells, one roving tab stop,
 * and the APG date-grid keys — arrows ±1/±7 days, Home/End to the week's
 * bounds, PageUp/PageDown ±1 month. Disabled days are stepped over.
 */
export const CalendarGrid = identify("Calendar.Grid", function CalendarGrid({ className, ref, ...props }: CalendarGridProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    visibleMonth,
    setVisibleMonth,
    monthLabel,
    dayLabel,
    selectionMode,
    firstDayOfWeek,
    isDateSelected,
    isDateDisabled,
    isOutsideMonth,
  } = useCalendarContext();

  const gridRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(ref, gridRef);
  // Arrow keys move this; crossing a month boundary also flips the visible
  // month, then the effect below restores DOM focus.
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const pendingFocus = useRef(false);

  const monthStart = startOfMonth(visibleMonth);
  const gridStart = addDays(monthStart, -((monthStart.getDay() - firstDayOfWeek + 7) % 7));
  const dates = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const weeks = Array.from({ length: 6 }, (_, w) => dates.slice(w * 7, w * 7 + 7));

  // The single tabbable cell: the roving target if it is in this month, else
  // the selected day, else today, else the first enabled day.
  const focusable = dates.filter((d) => !isOutsideMonth(d) && !isDateDisabled(d));
  const tabbableDate =
    (focusedDate && focusable.some((d) => isSameDay(d, focusedDate)) ? focusedDate : null) ??
    focusable.find((d) => isDateSelected(d)) ??
    focusable.find((d) => isToday(d)) ??
    focusable[0];

  useEffect(() => {
    if (!pendingFocus.current || !focusedDate) return;
    pendingFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(focusedDate)}"]`)?.focus();
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const base = focusedDate ?? tabbableDate;
    if (!base) return;

    const dow = (base.getDay() - firstDayOfWeek + 7) % 7;
    // [first candidate, stride to take while the candidate is disabled]
    let move: [Date, number];
    switch (event.key) {
      case "ArrowLeft": move = [addDays(base, -1), -1]; break;
      case "ArrowRight": move = [addDays(base, 1), 1]; break;
      case "ArrowUp": move = [addDays(base, -7), -7]; break;
      case "ArrowDown": move = [addDays(base, 7), 7]; break;
      case "Home": move = [addDays(base, -dow), 1]; break;
      case "End": move = [addDays(base, 6 - dow), -1]; break;
      case "PageUp": move = [addMonthsClamped(base, -1), -1]; break;
      case "PageDown": move = [addMonthsClamped(base, 1), 1]; break;
      default: return;
    }
    event.preventDefault();

    const target = nearestEnabled(move[0], move[1], isDateDisabled);
    if (!target) return;
    setFocusedDate(target);
    pendingFocus.current = true;
    if (isOutsideMonth(target)) setVisibleMonth(startOfMonth(target));
  };

  return (
    <div
      ref={mergedRef}
      role="grid"
      aria-label={monthLabel}
      aria-multiselectable={selectionMode !== "single" || undefined}
      onKeyDown={handleKeyDown}
      className={astralisMerge("astralis:flex astralis:flex-col astralis:gap-1", className)}
      {...props}
    >
      {weeks.map((week) => (
        <div key={dateKey(week[0])} role="row" className="astralis:grid astralis:grid-cols-7 astralis:gap-1">
          {week.map((date) => (
            <div key={dateKey(date)} role="gridcell" aria-selected={isDateSelected(date)}>
              <CalendarCell
                date={date}
                data-date={dateKey(date)}
                tabIndex={tabbableDate && isSameDay(date, tabbableDate) ? 0 : -1}
                onFocus={() => setFocusedDate(date)}
                aria-label={dayLabel(date)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
