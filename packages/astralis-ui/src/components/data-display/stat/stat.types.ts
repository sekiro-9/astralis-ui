import type { HTMLAttributes, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";

/**
 * The root owns the label/value/help stack; its parent owns how wide that
 * stack is and how it sits in a row — hence the placement props. It also
 * extends the div's own attributes, which it previously did not: an id or an
 * aria-label passed by a caller was silently dropped.
 */
export interface StatProps extends HTMLAttributes<HTMLDivElement>, PlacementProps {
  children: ReactNode;
  className?: string;
}

export interface StatLabelProps {
  children: ReactNode;
  className?: string;
}

export interface StatValueProps {
  children: ReactNode;
  className?: string;
}

export interface StatHelpTextProps {
  children: ReactNode;
  className?: string;
}

export interface StatIndicatorProps {
  type?: "increase" | "decrease";
  children?: ReactNode;
  className?: string;
}
