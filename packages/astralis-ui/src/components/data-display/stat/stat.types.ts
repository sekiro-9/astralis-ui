import type { HTMLAttributes, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";
import type { ResponsiveProp } from "../../../utils/responsive";

export type StatSize = "sm" | "md" | "lg" | "xl";
export type StatAlign = "start" | "center" | "end";

/** The root owns the label/value/help stack; its parent owns how wide that
 *  stack is and how it sits in a row — hence the placement props. */
export interface StatProps extends HTMLAttributes<HTMLDivElement>, PlacementProps {
  /**
   * Scales label, value and help text together. `md` is the dashboard KPI
   * size; `xl` is the marketing-band size. Responsive, so a band can read big
   * on desktop without overflowing a two-up mobile grid. @default "md"
   */
  size?: ResponsiveProp<StatSize>;
  /** How the three lines align within the stat. @default "start" */
  align?: ResponsiveProp<StatAlign>;
  children: ReactNode;
  className?: string;
}

/**
 * `size` on the parts is normally injected by the Stat root (server-side
 * cloning replaced the old context). Set it manually only when rendering a
 * part standalone or through a wrapper element the root can't see through.
 */
export interface StatLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatValueProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatHelpTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  type?: "increase" | "decrease";
  children?: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}
