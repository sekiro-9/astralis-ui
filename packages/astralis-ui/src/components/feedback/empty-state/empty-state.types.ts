import type { ComponentPropsWithoutRef } from "react";
import type { PlacementProps } from "../../../utils/placement";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps extends ComponentPropsWithoutRef<"div">, PlacementProps {
  /** Scales the indicator, title and description together. @default "md" */
  size?: EmptyStateSize;
}

export type EmptyStatePartProps = ComponentPropsWithoutRef<"div">;
