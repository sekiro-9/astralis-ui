"use client";

import { useHoverCard } from "../hover-card.context";
import type { HoverCardContentProps } from "../hover-card.types";
import { hoverCardContentClasses } from "../hover-card.styles";
import { Portal } from "../../portal";
import { usePresence } from "../../../../hooks/use-presence";
import { useAnchorPosition } from "../../../../hooks/use-anchor-position";
import { useDismiss } from "../../../../hooks/use-dismiss";
import { astralisMerge } from "../../../../utils/astralis-merge";

const DURATION = 160;

export function HoverCardContent({ children, className = "", onMouseEnter, onMouseLeave, ...rest }: HoverCardContentProps) {
  const { open, hide, showNow, scheduleClose, triggerRef, contentRef, contentId, side, align, sideOffset, avoidCollisions } = useHoverCard();
  const { mounted, state } = usePresence(open, DURATION);
  const { x, y, side: resolvedSide } = useAnchorPosition({
    open: mounted, anchorRef: triggerRef, floatingRef: contentRef, side, align, sideOffset, avoidCollisions,
  });

  // Escape through the overlay stack, so a card over a Modal closes alone.
  useDismiss(open, hide, { refs: [triggerRef, contentRef], closeOnOutsidePointer: false, transient: true });

  if (!mounted) return null;
  const isOpen = state === "open";

  return (
    <Portal>
      <div
        ref={contentRef}
        id={contentId}
        data-side={resolvedSide}
        // Entering the card cancels the pending close — the whole point.
        onMouseEnter={(e) => { onMouseEnter?.(e); showNow(); }}
        onMouseLeave={(e) => { onMouseLeave?.(e); scheduleClose(); }}
        style={{ left: x, top: y, transitionDuration: `${DURATION}ms` }}
        className={astralisMerge(
          hoverCardContentClasses,
          "astralis:transition-[opacity,transform]",
          isOpen ? "astralis:opacity-100 astralis:scale-100" : "astralis:opacity-0 astralis:scale-95",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

HoverCardContent.displayName = "HoverCard.Content";
