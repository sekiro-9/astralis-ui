import type { Ref } from "react";
import type { CalendarHeaderProps } from "../calendar.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function CalendarHeader({ className, ref, ...props }: CalendarHeaderProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={astralisMerge("astralis:flex astralis:items-center astralis:justify-between astralis:gap-2", className)}
      {...props}
    />
  );
}

CalendarHeader.displayName = "Calendar.Header";
