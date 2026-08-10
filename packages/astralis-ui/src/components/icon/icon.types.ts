import type { PlacementProps } from "../../utils/placement";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { textColors } from "../../const/color-mappings";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;
/** Any semantic text-colour token (icons inherit colour via `currentColor`). */
export type IconColor = keyof typeof textColors;

/*
 * `order` is dropped from the SVG props so the flex-item `order` can take the
 * name. SVG's own `order` belongs to <feConvolveMatrix> and means nothing on
 * an <svg> root, whereas ordering an icon among its siblings is real.
 */
export interface IconProps
  extends Omit<ComponentPropsWithoutRef<"svg">, "color" | "order">,
    PlacementProps {
  /** Render this icon component (e.g. a Lucide / Heroicons component, or your own). */
  as?: ElementType;
  /** …or pass a raw `<svg>` as children. */
  children?: ReactNode;
  /** Token (`xs`–`xl`) or an explicit pixel number. */
  size?: IconSize;
  /** A semantic text-colour token; omit to inherit the surrounding text colour. */
  color?: IconColor;
  strokeWidth?: number;
}
