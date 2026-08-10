import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type BadgeVariant = "solid" | "subtle" | "surface" | "outline";
export type BadgeSize = "xs" | "sm" | "md" | "lg";

/**
 * **Badge is for state** — a condition the thing is currently in: `Active`,
 * `Beta`, `3 unread`, `Failed`. It is read-only by design, which is why it has
 * no close button and no group.
 *
 * For a keyword the thing *carries* rather than a state it is *in* — a topic,
 * a filter, a category — reach for `Tag`, which adds `closable`,
 * `Tag.Checkable` and `Tag.Group`. The two render nearly the same chip (Badge
 * is pill-shaped, Tag is rounded), so the name is the only thing telling a
 * reader which one you meant: pick by meaning, not by radius.
 */
export interface BadgeProps extends Omit<ComponentPropsWithoutRef<"span">, "color">, PlacementProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  /** Hue the badge paints with. @default "gray" */
  colorScheme?: ColorScheme;
  size?: BadgeSize;
  className?: string;
}
