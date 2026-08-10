import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, HTMLAttributes } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type TagSize = "xs" | "sm" | "md" | "lg";
export type TagVariant = "solid" | "subtle" | "surface" | "outline";
export type TagColorScheme = ColorScheme;

/**
 * **Tag is for labels** — a keyword the thing carries: a topic, a category, a
 * filter, a selected value. That's why it can be removed (`closable`),
 * selected (`Tag.Checkable`) and grouped (`Tag.Group`).
 *
 * For a state the thing is *in* rather than a keyword it *carries* — `Active`,
 * `Beta`, `3 unread` — reach for `Badge`. The two render nearly the same chip
 * (Tag is rounded, Badge is pill-shaped), so the name is the only thing
 * telling a reader which one you meant: pick by meaning, not by radius.
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, PlacementProps {
  children?: ReactNode;
  size?: TagSize;
  variant?: TagVariant;
  /** Hue the tag paints with. @default "gray" */
  colorScheme?: TagColorScheme;
  /** Element before the label (icon, avatar…). */
  startElement?: ReactNode;
  /** Element after the label (icon…). */
  endElement?: ReactNode;
  /** Show a remove button that calls `onClose`. */
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface CheckableTagProps
  extends Omit<TagProps, "variant" | "colorScheme" | "closable" | "onClose" | "onChange"> {
  /** Selected state. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Hue used when checked. @default "brand" */
  colorScheme?: ColorScheme;
}

export interface TagOption {
  label: ReactNode;
  value: string | number;
}

export interface CheckableTagGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  options: TagOption[] | (string | number)[];
  multiple?: boolean;
  size?: TagSize;
  colorScheme?: ColorScheme;
  className?: string;
  style?: CSSProperties;
}
