import type { ComponentPropsWithoutRef } from "react";

export type ScrollAreaDirection = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends ComponentPropsWithoutRef<"div"> {
  /** Which axis scrolls. @default "vertical" */
  direction?: ScrollAreaDirection;
  /** Hide the scrollbar entirely (content still scrolls). */
  hideScrollbar?: boolean;
}
