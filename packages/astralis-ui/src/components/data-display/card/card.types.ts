import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";

export type CardSize = "sm" | "md" | "lg";
export type CardVariant = "elevated" | "outline" | "filled" | "unstyled";

/* ------------------------------------------------------------------ */
/* CardRoot                                                             */
/* ------------------------------------------------------------------ */

/**
 * Card owns how it LOOKS — variant, size, hoverable — and its parent owns
 * WHERE IT SITS. So it takes its own recipe props plus the placement set
 * (w/h/min/max, flex-item, margin), and none of Box's paint props: repainting
 * a Card's background or border from the outside would defeat the variants.
 *
 * Placement has to be here rather than "a wrapper's job" because the component
 * cannot know it — only the composition can. Without it, stretching a Card in
 * a row cost an extra node purely to reach one prop, which is why no block
 * used Card at all.
 */
export interface CardRootProps extends HTMLAttributes<HTMLDivElement>, PlacementProps {
  /** Visual style of the card */
  variant?: CardVariant;
  /** Controls padding and border-radius */
  size?: CardSize;
  /** Lift card on hover */
  hoverable?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* CardHeader                                                           */
/* ------------------------------------------------------------------ */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Content rendered in the trailing slot (e.g. a button or link) */
  extra?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* CardTitle                                                            */
/* ------------------------------------------------------------------ */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* CardDescription                                                      */
/* ------------------------------------------------------------------ */

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* CardBody                                                             */
/* ------------------------------------------------------------------ */

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* CardFooter                                                           */
/* ------------------------------------------------------------------ */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
