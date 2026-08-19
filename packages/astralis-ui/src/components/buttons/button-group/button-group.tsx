import { splitPlacement } from "../../../utils/placement";
import type { HTMLAttributes, Ref } from "react";
import { buttonGroupVariants } from "./button-group.styles";
import type { ButtonGroupProps } from "./button-group.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { inheritProps } from "../../../utils/inherit-props";
import { Button } from "../button/button";

/**
 * Groups related buttons and shares `size`/`variant`/`colorScheme`/`disabled`
 * down to them by cloning (an explicit prop on a Button always wins; only
 * DIRECT Button children inherit — a wrapped Button falls back to its own
 * defaults). With `attached`, the buttons render as one segmented control
 * (collapsed inner radii, merged borders).
 */
export function ButtonGroup({
  children,
  orientation = "horizontal",
  attached = false,
  spacing = "md",
  size,
  variant,
  colorScheme,
  disabled,
  className = "",
  role = "group",
  ref,
  ...props
}: ButtonGroupProps & { ref?: Ref<HTMLDivElement> }) {
    const { placementClass, rest: domProps } = splitPlacement(props);

    const shared: Record<string, unknown> = {};
    if (size !== undefined) shared.size = size;
    if (variant !== undefined) shared.variant = variant;
    if (colorScheme !== undefined) shared.colorScheme = colorScheme;
    if (disabled !== undefined) shared.disabled = disabled;

    return (
      <div
        ref={ref}
        role={role}
        className={astralisMerge(
          buttonGroupVariants({ orientation, attached, spacing }),
          placementClass,
          className
        )}
        {...(domProps as HTMLAttributes<HTMLDivElement>)}
      >
        {inheritProps(children, new Map([[Button, shared]]))}
      </div>
    );
}

ButtonGroup.displayName = "ButtonGroup";
