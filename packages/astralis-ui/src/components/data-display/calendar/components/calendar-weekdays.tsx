"use client";

import { useMemo, type Ref } from "react";
import { useCalendarContext } from "../calendar.context";
import type { CalendarWeekdaysProps } from "../calendar.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

/** Visual column headings. Hidden from assistive tech: each day's accessible
 *  name in the grid already carries its weekday. */
export const CalendarWeekdays = identify("Calendar.Weekdays", function CalendarWeekdays({ className, ref, ...props }: CalendarWeekdaysProps & { ref?: Ref<HTMLDivElement> }) {
  const { locale, firstDayOfWeek } = useCalendarContext();

  const labels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 7 Jan 2024 is a Sunday, so index 0 is Sunday like Date#getDay.
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + ((index + firstDayOfWeek) % 7))));
  }, [firstDayOfWeek, locale]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={astralisMerge("astralis:grid astralis:grid-cols-7 astralis:gap-1", className)}
      {...props}
    >
      {labels.map((label, index) => (
        <div
          key={index}
          className="astralis:flex astralis:h-8 astralis:items-center astralis:justify-center astralis:text-xs astralis:font-medium astralis:uppercase astralis:tracking-wide astralis:text-label-subtle"
        >
          {label}
        </div>
      ))}
    </div>
  );
});
