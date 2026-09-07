import type { ComponentPropsWithoutRef } from "react";
import type { PlacementProps } from "../../../utils/placement";

export type ScrollAreaDirection = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends ComponentPropsWithoutRef<"div">, PlacementProps {
  /** Which axis scrolls. @default "vertical" */
  direction?: ScrollAreaDirection;
  /** Hide the scrollbar entirely (content still scrolls). */
  hideScrollbar?: boolean;
}
