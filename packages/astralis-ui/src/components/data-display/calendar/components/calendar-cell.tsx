"use client";

import type { Ref } from "react";
import { useCalendarContext } from "../calendar.context";
import type { CalendarCellProps } from "../calendar.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { isToday } from "../calendar.utils";

const SIZE_MAP = {
  sm: "astralis:h-8 astralis:w-8",
  md: "astralis:h-9 astralis:w-9",
  lg: "astralis:h-10 astralis:w-10",
} as const;

export function CalendarCell({
  date,
  className,
  children,
  onClick,
  ref,
  ...props
}: CalendarCellProps & { ref?: Ref<HTMLButtonElement> }) {
  const { showOutsideDays, isOutsideMonth, isDateDisabled, isDateSelected, isDateInRange, selectDate, dayLabel, size } =
    useCalendarContext();

  const outside = isOutsideMonth(date);
  const disabled = isDateDisabled(date);
  const selected = isDateSelected(date);
  const inRange = isDateInRange(date);
  const today = isToday(date);

  if (outside && !showOutsideDays) {
    return <div className={SIZE_MAP[size]} />;
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={dayLabel(date)}
      aria-pressed={selected}
      aria-current={today ? "date" : undefined}
      data-selected={selected ? "true" : "false"}
      data-in-range={inRange ? "true" : "false"}
      data-outside={outside ? "true" : "false"}
      className={astralisMerge(
        "astralis:inline-flex astralis:items-center astralis:justify-center astralis:rounded-md astralis:border-normal astralis:border-transparent astralis:font-medium astralis:transition-colors",
        "astralis:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring",
        SIZE_MAP[size],
        selected && "astralis:bg-accent-solid astralis:text-accent-contrast astralis:hover:opacity-higher",
        !selected && inRange && "astralis:bg-accent-subtle astralis:text-accent-label",
        !selected && !inRange && "astralis:text-label-base astralis:hover:bg-surface-subtle",
        outside && !selected && "astralis:text-label-subtle",
        today && !selected && "astralis:border-stroke-base",
        disabled && "astralis:cursor-not-allowed astralis:opacity-moderate astralis:hover:bg-transparent",
        className,
      )}
      onClick={(event) => {
        selectDate(date);
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? date.getDate()}
    </button>
  );
}

CalendarCell.displayName = "Calendar.Cell";
