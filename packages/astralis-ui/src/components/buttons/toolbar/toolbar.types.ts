import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { BoxStyleProps } from "../../layout/box/box.types";
import type { PlacementProps } from "../../../utils/placement";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarProps extends ComponentPropsWithoutRef<"div">, PlacementProps {
  /** Arrow-key axis and layout direction. @default "horizontal" */
  orientation?: ToolbarOrientation;
  /** Accessible name — a toolbar without one is just a row of buttons. */
  label?: string;
  children: ReactNode;
}

export type ToolbarGroupProps = ComponentPropsWithoutRef<"div">;

/** Separator retypes the Box style names (`color`, `w`…) as tokens, so only
 *  the plain attributes pass through the preset. */
export type ToolbarSeparatorProps = Omit<ComponentPropsWithoutRef<"div">, keyof BoxStyleProps>;
