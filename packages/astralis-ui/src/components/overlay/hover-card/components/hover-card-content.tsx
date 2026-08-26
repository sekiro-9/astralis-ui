"use client";

import { useEffect } from "react";
import { useHoverCard } from "../hover-card.context";
import type { HoverCardContentProps } from "../hover-card.types";
import { hoverCardContentClasses } from "../hover-card.styles";
import { Portal } from "../../portal";
import { usePresence } from "../../../../hooks/use-presence";
import { useAnchorPosition } from "../../../../hooks/use-anchor-position";
import { astralisMerge } from "../../../../utils/astralis-merge";

const DURATION = 160;

export function HoverCardContent({ children, className = "", onMouseEnter, onMouseLeave, ...rest }: HoverCardContentProps) {
  const { open, hide, showNow, scheduleClose, triggerRef, contentRef, contentId, side, align, sideOffset, avoidCollisions } = useHoverCard();
  const { mounted, state } = usePresence(open, DURATION);
  const { x, y, side: resolvedSide } = useAnchorPosition({
    open: mounted, anchorRef: triggerRef, floatingRef: contentRef, side, align, sideOffset, avoidCollisions,
  });

  // Escape dismisses.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide]);

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
