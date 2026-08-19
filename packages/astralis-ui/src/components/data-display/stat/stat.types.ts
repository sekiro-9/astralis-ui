import type { HTMLAttributes, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";
import type { ResponsiveProp } from "../../../utils/responsive";

export type StatSize = "sm" | "md" | "lg" | "xl";
export type StatAlign = "start" | "center" | "end";

/**
 * The root owns the label/value/help stack; its parent owns how wide that
 * stack is and how it sits in a row — hence the placement props. It also
 * extends the div's own attributes, which it previously did not: an id or an
 * aria-label passed by a caller was silently dropped.
 */
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
export interface StatLabelProps {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatValueProps {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatHelpTextProps {
  children: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}

export interface StatIndicatorProps {
  type?: "increase" | "decrease";
  children?: ReactNode;
  className?: string;
  size?: ResponsiveProp<StatSize>;
}
