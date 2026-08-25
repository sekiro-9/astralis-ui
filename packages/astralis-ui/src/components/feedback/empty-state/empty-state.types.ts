import type { ComponentPropsWithoutRef } from "react";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps extends ComponentPropsWithoutRef<"div"> {
  /** Scales the indicator, title and description together. @default "md" */
  size?: EmptyStateSize;
}

export type EmptyStatePartProps = ComponentPropsWithoutRef<"div">;
