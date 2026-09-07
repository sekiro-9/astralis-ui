import type { ScrollAreaProps } from "./scroll-area.types";
import { scrollAreaDirections, scrollAreaBar, scrollAreaHidden, scrollAreaFocus } from "./scroll-area.styles";
import { astralisMerge } from "../../../utils/astralis-merge";
import { splitPlacement } from "../../../utils/placement";

/**
 * A scroll container with themed scrollbars. The scrollbars are the
 * platform's own, restyled with CSS — keyboard scrolling, momentum and RTL
 * stay native, and the component ships zero client JavaScript. Give it a
 * height (or max-height); without one there is nothing to scroll.
 */
export function ScrollArea({
  direction = "vertical",
  hideScrollbar,
  className = "",
  children,
  ...rest
}: ScrollAreaProps) {
  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <div
      // Keyboard users can only scroll a region they can focus. Knowing
      // whether it overflows takes client JS, so it is always a tab stop;
      // pass tabIndex={-1} when the content is itself focusable.
      tabIndex={0}
      className={astralisMerge(
        scrollAreaDirections[direction],
        hideScrollbar ? scrollAreaHidden : scrollAreaBar,
        scrollAreaFocus,
        placementClass,
        className,
      )}
      {...domProps}
    >
      {children}
    </div>
  );
}

ScrollArea.displayName = "ScrollArea";
