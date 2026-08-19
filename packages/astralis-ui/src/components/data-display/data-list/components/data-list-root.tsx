import { splitPlacement } from "../../../../utils/placement";
import type { DataListProps } from "../data-list.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

const gapForSize = { sm: "astralis:gap-2", md: "astralis:gap-3", lg: "astralis:gap-4" } as const;

export function DataListRoot({ children, orientation = "horizontal", size = "md", className = "", ...rest }: DataListProps) {
  const { placementClass, placementStyle } = splitPlacement(rest);
  return (
    <dl
      // The parts read these through CSS parent-keyed variants (see
      // data-list.styles.ts) — no context, so the compound stays a Server
      // Component.
      data-datalist-size={size}
      data-datalist-orientation={orientation}
      className={astralisMerge("astralis:flex astralis:flex-col", gapForSize[size], placementClass, className)}
      style={placementStyle}
    >{children}</dl>
  );
}
