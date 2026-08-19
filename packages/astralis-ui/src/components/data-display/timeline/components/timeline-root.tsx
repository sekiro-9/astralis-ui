import { splitPlacement } from "../../../../utils/placement";
import type { TimelineProps } from "../timeline.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";

export function TimelineRoot({ children, size = "md", variant = "solid", colorScheme = "brand", className = "", ...rest }: TimelineProps) {
  const { placementClass, placementStyle } = splitPlacement(rest);

  return (
    <div
      // Size/variant reach the parts through CSS parent-keyed variants (see
      // timeline.styles.ts); the hue reaches the indicators through the accent
      // variables this class sets on the subtree. Last-item detection is
      // :last-child, so no per-item context either — the whole compound is a
      // Server Component.
      data-timeline-size={size}
      data-timeline-variant={variant}
      className={astralisMerge("astralis:flex astralis:flex-col", accentClass(colorScheme), placementClass, className)}
      style={placementStyle}
    >
      {children}
    </div>
  );
}
