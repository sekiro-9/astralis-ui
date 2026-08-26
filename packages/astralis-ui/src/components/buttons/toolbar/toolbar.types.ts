import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarProps extends ComponentPropsWithoutRef<"div"> {
  /** Arrow-key axis and layout direction. @default "horizontal" */
  orientation?: ToolbarOrientation;
  /** Accessible name — a toolbar without one is just a row of buttons. */
  label?: string;
  children: ReactNode;
}

export type ToolbarGroupProps = ComponentPropsWithoutRef<"div">;
