"use client";

import { useEffect, useLayoutEffect } from "react";
import { Portal } from "../../overlay/portal";
import { useMenu } from "../menu.context";
import type { MenuContentProps } from "../menu.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { usePresence } from "../../../hooks/use-presence";
import { useAnchorPosition } from "../../../hooks/use-anchor-position";
import { useDismiss } from "../../../hooks/use-dismiss";
import { useRovingFocus } from "../../../hooks/use-roving-focus";
import { useMergedRefs } from "../../../utils/merge-refs";
import { menuContentClasses, menuMotionClasses } from "../menu.styles";
import { identify } from "../../../utils/dev-identity";

const DURATION = 160;

export const MenuContent = identify("Menu.Content", function MenuContent({ className = "", children, onKeyDown, ...rest }: MenuContentProps) {
  const { open, close, triggerRef, contentRef, contentId, side, align, sideOffset, focusIntentRef, repositionRef } = useMenu();
  const { mounted, state } = usePresence(open, DURATION);

  const { x, y, side: resolvedSide, update } = useAnchorPosition({
    open: mounted,
    anchorRef: triggerRef,
    floatingRef: contentRef,
    side,
    align,
    sideOffset,
  });

  useLayoutEffect(() => {
    repositionRef.current = update;
    return () => {
      repositionRef.current = null;
    };
  }, [repositionRef, update]);

  useDismiss(open, close, { refs: [triggerRef, contentRef] });

  const roving = useRovingFocus<HTMLDivElement>({
    itemSelector: "[data-astralis-menu-item]",
    orientation: "vertical",
    typeahead: true,
  });
  const { focusFirst, focusLast } = roving;
  const panelRef = useMergedRefs(contentRef, roving.containerRef);

  // Focus an item on open; hand focus back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const timer = setTimeout(() => {
      if (focusIntentRef.current === "last") focusLast();
      else focusFirst();
      focusIntentRef.current = "first";
    }, 0);
    return () => {
      clearTimeout(timer);
      trigger?.focus();
    };
  }, [open, triggerRef, focusIntentRef, focusFirst, focusLast]);

  if (!mounted) return null;

  return (
    <Portal>
      <div
        ref={panelRef}
        id={contentId}
        role="menu"
        aria-orientation="vertical"
        tabIndex={-1}
        data-side={resolvedSide}
        style={{ left: x, top: y, transitionDuration: `${DURATION}ms` }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          // Tab leaves a menu by closing it (APG); arrows/Home/End/typeahead rove.
          if (e.key === "Tab") {
            close();
            return;
          }
          roving.onKeyDown(e);
        }}
        className={astralisMerge(menuContentClasses, menuMotionClasses(state), className)}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
});
