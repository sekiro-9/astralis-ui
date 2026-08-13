import type { PlacementProps } from "../../../utils/placement";
import type { CSSProperties, ReactNode } from "react";

export type DataListOrientation = "horizontal" | "vertical";
export type DataListSize = "sm" | "md" | "lg";

export interface DataListProps extends PlacementProps {
  children: ReactNode;
  /** `horizontal` lays label + value side by side; `vertical` stacks them. @default "horizontal" */
  orientation?: DataListOrientation;
  size?: DataListSize;
  className?: string;
}

export interface DataListItemProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}

export interface DataListLabelProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}

export interface DataListValueProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}
