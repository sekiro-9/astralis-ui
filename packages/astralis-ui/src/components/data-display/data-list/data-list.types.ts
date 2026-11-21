import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

export type DataListOrientation = "horizontal" | "vertical";
export type DataListSize = "sm" | "md" | "lg";

export interface DataListProps extends ComponentPropsWithoutRef<"dl">, PlacementProps {
  children: ReactNode;
  /** `horizontal` lays label + value side by side; `vertical` stacks them. @default "horizontal" */
  orientation?: DataListOrientation;
  size?: DataListSize;
  className?: string;
}

export interface DataListItemProps extends ComponentPropsWithoutRef<"div">, PlacementProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}

export interface DataListLabelProps extends ComponentPropsWithoutRef<"dt">, PlacementProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}

export interface DataListValueProps extends ComponentPropsWithoutRef<"dd">, PlacementProps {
  children: ReactNode;
  className?: string;
  /** The one-off escape hatch — always forwarded, always wins. */
  style?: CSSProperties;
}
