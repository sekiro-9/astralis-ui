import type { PlacementProps } from "../../../utils/placement";
import type {
  ReactNode,
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export type TableVariant = "line" | "outline";
export type TableSize = "sm" | "md" | "lg";

export interface TableProps extends HTMLAttributes<HTMLTableElement>, PlacementProps {
  children: ReactNode;
  variant?: TableVariant;
  size?: TableSize;
  /** Zebra-stripe the body rows. */
  striped?: boolean;
  /** Highlight rows on hover. */
  interactive?: boolean;
  /** Pin the header while the body scrolls. */
  stickyHeader?: boolean;
  className?: string;
}

export interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement>, PlacementProps {
  children: ReactNode;
  className?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement>, PlacementProps {
  children: ReactNode;
  className?: string;
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement>, PlacementProps {
  children?: ReactNode;
  className?: string;
}

/** `width`/`height` stay the td's own HTML attributes, as they were before
 *  cells took placement props; `w`/`h` are the style props. */
export interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement>,
    Omit<PlacementProps, "width" | "height"> {
  children?: ReactNode;
  className?: string;
}

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement>, PlacementProps {
  placement?: "top" | "bottom";
  className?: string;
}
