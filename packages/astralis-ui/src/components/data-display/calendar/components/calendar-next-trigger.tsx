"use client";

import type { Ref } from "react";
import type { CalendarTriggerProps } from "../calendar.types";
import { useCalendarContext } from "../calendar.context";
import { addMonths } from "../calendar.utils";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { ChevronRightIcon } from "../../../icon/internal-icons";

export function CalendarNextTrigger({
  className,
  onClick,
  children,
  ref,
  ...props
}: CalendarTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  const { visibleMonth, setVisibleMonth } = useCalendarContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Next month"
      className={astralisMerge(
        "astralis:inline-flex astralis:h-8 astralis:w-8 astralis:items-center astralis:justify-center astralis:rounded-md astralis:text-label-muted astralis:hover:bg-surface-subtle astralis:hover:text-label-base",
        "astralis:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring",
        className,
      )}
      onClick={(event) => {
        setVisibleMonth(addMonths(visibleMonth, 1));
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronRightIcon aria-hidden="true" className="astralis:h-4 astralis:w-4" />}
    </button>
  );
}

CalendarNextTrigger.displayName = "Calendar.NextTrigger";
