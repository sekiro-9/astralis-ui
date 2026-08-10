import type { PlacementProps } from "../../../utils/placement";
import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";
import type { kbdVariants } from "./kbd.styles";

export type KbdSize = NonNullable<VariantProps<typeof kbdVariants>["size"]>;

export interface KbdProps
  extends ComponentPropsWithoutRef<"kbd">,
    VariantProps<typeof kbdVariants>, PlacementProps {
  /** React 19: ref is a regular prop — no forwardRef needed. */
  ref?: Ref<HTMLElement>;
}
