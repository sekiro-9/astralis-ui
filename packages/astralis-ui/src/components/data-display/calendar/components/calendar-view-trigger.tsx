"use client";

import type { Ref } from "react";
import type { CalendarTriggerProps } from "../calendar.types";
import { useCalendarContext } from "../calendar.context";
import { astralisMerge } from "../../../../utils/astralis-merge";

/** The month title. Live, so paging months is announced. */
export function CalendarViewTrigger({
  className,
  children,
  ref,
  ...props
}: CalendarTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  const { monthLabel } = useCalendarContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-live="polite"
      className={astralisMerge(
        "astralis:flex-1 astralis:rounded-md astralis:px-2 astralis:py-1 astralis:text-center astralis:font-semibold astralis:text-label-base",
        className,
      )}
      {...props}
    >
      {children ?? monthLabel}
    </button>
  );
}

CalendarViewTrigger.displayName = "Calendar.ViewTrigger";
