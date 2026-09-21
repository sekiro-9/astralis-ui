"use client";

import { useLayoutEffect, useState, type MouseEvent } from "react";
import { MenuRoot } from "../../components/menu-root";
import { useMenu } from "../../menu.context";
import type { ContextMenuProps, ContextMenuTriggerProps } from "../context-menu.types";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef } from "../../../overlay/slot";
import { identify } from "../../../../utils/dev-identity";

/**
 * Menu opened by right-click, positioned at the pointer. Everything else IS
 * Menu — same context, content, items, roving focus and dismissal — anchored
 * to a 1px point placed where the pointer was instead of to a trigger button.
 */
export const ContextMenuRoot = identify("ContextMenu", function ContextMenuRoot({ children, ...props }: ContextMenuProps) {
  return (
    <MenuRoot side="bottom" align="start" sideOffset={2} {...props}>
      {children}
    </MenuRoot>
  );
});

export const ContextMenuTrigger = identify("ContextMenu.Trigger", function ContextMenuTrigger({ children, ref, ...rest }: ContextMenuTriggerProps) {
  const { setOpen, triggerRef, open, contentId, repositionRef } = useMenu();
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(ref, slotChildRef(child));

  // A right-click while already open moves the anchor under a mounted panel,
  // and the positioner only measures on open, scroll and resize by itself.
  useLayoutEffect(() => {
    if (open && point) repositionRef.current?.();
  }, [open, point, repositionRef]);

  return (
    <>
      {cloneSlot(child, rest, {
        ref: mergedRef,
        onContextMenu: (e: MouseEvent) => {
          e.preventDefault();
          // An outside right-click first dismisses (pointerdown hits the
          // shared overlay stack), so this always opens fresh at the pointer.
          setPoint({ x: e.clientX, y: e.clientY });
          setOpen(true);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? contentId : undefined,
      })}
      {point && (
        // The virtual anchor: focusable (-1) so focus return on close lands
        // somewhere real, invisible, and exactly under the last right-click.
        <span
          ref={(node) => {
            if (node) triggerRef.current = node;
          }}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "fixed", left: point.x, top: point.y, width: 1, height: 1 }}
        />
      )}
    </>
  );
});
