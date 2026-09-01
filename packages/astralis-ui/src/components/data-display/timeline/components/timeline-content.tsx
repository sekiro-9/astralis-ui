import type { TimelineContentProps, TimelineTextProps } from "../timeline.types";
import { timelineTitleSize } from "../timeline.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TimelineContent({ children, className = "", ...rest }: TimelineContentProps) {
  return <div className={astralisMerge("astralis:flex astralis:flex-col astralis:gap-0.5 astralis:pt-0.5", className)} {...rest}>{children}</div>;
}
TimelineContent.displayName = "Timeline.Content";

export function TimelineTitle({ children, className = "", ...rest }: TimelineTextProps) {
  return <span className={astralisMerge("astralis:font-medium astralis:text-label-base", timelineTitleSize, className)} {...rest}>{children}</span>;
}
TimelineTitle.displayName = "Timeline.Title";

export function TimelineDescription({ children, className = "", ...rest }: TimelineTextProps) {
  return <span className={astralisMerge("astralis:text-sm astralis:text-label-muted", className)} {...rest}>{children}</span>;
}
TimelineDescription.displayName = "Timeline.Description";
