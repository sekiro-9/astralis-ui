import type { ScrollAreaProps } from "./scroll-area.types";
import { scrollAreaDirections, scrollAreaBar, scrollAreaHidden } from "./scroll-area.styles";
import { astralisMerge } from "../../../utils/astralis-merge";

/**
 * A scroll container with themed scrollbars. The scrollbars are the
 * platform's own, restyled with CSS — keyboard scrolling, momentum and RTL
 * stay native, and the component ships zero client JavaScript. Give it a
 * height (or max-height) via className or style; without one there is
 * nothing to scroll.
 */
export function ScrollArea({
  direction = "vertical",
  hideScrollbar,
  className = "",
  children,
  ...rest
}: ScrollAreaProps) {
  return (
    <div
      className={astralisMerge(
        scrollAreaDirections[direction],
        hideScrollbar ? scrollAreaHidden : scrollAreaBar,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

ScrollArea.displayName = "ScrollArea";
