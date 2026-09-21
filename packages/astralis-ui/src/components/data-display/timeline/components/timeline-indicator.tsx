import type { TimelineIndicatorProps } from "../timeline.types";
import { timelineIndicatorClasses } from "../timeline.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { identify } from "../../../../utils/dev-identity";

export const TimelineIndicator = identify("Timeline.Indicator", function TimelineIndicator({ children, colorScheme, className = "", ...rest }: TimelineIndicatorProps) {
  return (
    <span
      aria-hidden={children ? undefined : true}
      // No own accent class unless overriding: the root's accent variables
      // cascade down, so the indicator inherits the timeline's hue for free.
      className={astralisMerge(timelineIndicatorClasses, colorScheme ? accentClass(colorScheme) : "", className)}
      {...rest}
    >
      {children}
    </span>
  );
});
