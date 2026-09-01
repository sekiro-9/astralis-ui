import type { PlacementProps } from "../../../utils/placement";
import type { HTMLAttributes, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type TimelineSize = "sm" | "md" | "lg";
export type TimelineVariant = "solid" | "subtle" | "outline";

export interface TimelineProps extends HTMLAttributes<HTMLDivElement>, PlacementProps {
  children: ReactNode;
  size?: TimelineSize;
  variant?: TimelineVariant;
  /** Default hue for indicators. @default "brand" */
  colorScheme?: ColorScheme;
  className?: string;
}

export interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface TimelineIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  /** Override the item's hue (e.g. green for done, red for error). */
  colorScheme?: ColorScheme;
  className?: string;
}

export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface TimelineTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
}
