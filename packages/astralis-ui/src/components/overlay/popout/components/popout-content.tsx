import type { CSSProperties, Ref } from "react";
import type { PopoutContentProps } from "../popout.types";
import { popoutContentClasses, positionArea, positionFallbacks } from "../popout.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * The panel: `popover="auto"` (light dismiss + Esc + top layer, from the
 * platform) positioned by CSS anchor positioning against the trigger's
 * implicit anchor — no anchor-name, no measuring, no scroll listeners.
 * In browsers without anchor positioning the panel still opens and closes
 * correctly and falls back to the UA's centered top-layer placement.
 */
export function PopoutContent({
  popoutId,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  className = "",
  style,
  children,
  ref,
  ...rest
}: PopoutContentProps & { ref?: Ref<HTMLDivElement> }) {
  const anchored: CSSProperties = {
    positionArea: positionArea(side, align),
    positionTryFallbacks: positionFallbacks(side),
    margin: sideOffset,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      id={popoutId}
      popover="auto"
      className={astralisMerge(popoutContentClasses, className)}
      style={{ ...anchored, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

PopoutContent.displayName = "Popout.Content";
