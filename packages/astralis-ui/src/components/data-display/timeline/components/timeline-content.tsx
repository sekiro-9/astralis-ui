import type { TimelineContentProps, TimelineTextProps } from "../timeline.types";
import { timelineTitleSize } from "../timeline.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const TimelineContent = identify("Timeline.Content", function TimelineContent({ children, className = "", ...rest }: TimelineContentProps) {
  return <div className={astralisMerge("astralis:flex astralis:flex-col astralis:gap-0.5 astralis:pt-0.5", className)} {...rest}>{children}</div>;
});

export const TimelineTitle = identify("Timeline.Title", function TimelineTitle({ children, className = "", ...rest }: TimelineTextProps) {
  return <span className={astralisMerge("astralis:font-medium astralis:text-label-base", timelineTitleSize, className)} {...rest}>{children}</span>;
});

export const TimelineDescription = identify("Timeline.Description", function TimelineDescription({ children, className = "", ...rest }: TimelineTextProps) {
  return <span className={astralisMerge("astralis:text-sm astralis:text-label-muted", className)} {...rest}>{children}</span>;
});
