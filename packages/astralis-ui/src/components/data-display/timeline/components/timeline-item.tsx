import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import type { TimelineItemProps } from "../timeline.types";
import { timelineColumnWidth, timelineConnectorClasses } from "../timeline.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { TimelineIndicator } from "./timeline-indicator";
import { identify } from "../../../../utils/dev-identity";

/**
 * Lays out one entry: an indicator column with the connecting line drawn beneath
 * it (hidden on the last item via CSS :last-child — no context), and the content
 * beside it. Splits its children into the Indicator and everything else by
 * component identity.
 */
export const TimelineItem = identify("Timeline.Item", function TimelineItem({ children, className = "", ...rest }: TimelineItemProps) {
  let indicator: ReactElement | null = null;
  const others: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === TimelineIndicator) {
      indicator = child;
    } else {
      others.push(child);
    }
  });

  return (
    <div data-timeline-item="" className={astralisMerge("astralis:flex astralis:gap-3", className)} {...rest}>
      <div className={astralisMerge("astralis:flex astralis:flex-col astralis:items-center astralis:shrink-0", timelineColumnWidth)}>
        {indicator}
        <div className={timelineConnectorClasses} />
      </div>
      <div className="astralis:flex-1 astralis:min-w-0 astralis:pb-6">{others}</div>
    </div>
  );
});
