"use client";

import { cloneElement, useLayoutEffect, useState, type MouseEvent } from "react";
import { MenuRoot } from "../../components/menu-root";
import { useMenu } from "../../menu.context";
import type { ContextMenuProps, ContextMenuTriggerProps } from "../context-menu.types";
import { resolveServerChild } from "../../../../utils/resolve-server-child";

/**
 * Menu opened by right-click, positioned at the pointer. Everything else IS
 * Menu — same context, content, items, roving focus and dismissal — anchored
 * to a 1px point placed where the pointer was instead of to a trigger button.
 */
export function ContextMenuRoot({ children, ...props }: ContextMenuProps) {
  return (
    <MenuRoot side="bottom" align="start" sideOffset={2} {...props}>
      {children}
    </MenuRoot>
  );
}

ContextMenuRoot.displayName = "ContextMenu";

export function ContextMenuTrigger({ children }: ContextMenuTriggerProps) {
  const { setOpen, triggerRef, open, contentId } = useMenu();
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const child = resolveServerChild(children) as ContextMenuTriggerProps["children"];

  // A right-click while already open moves the anchor under a mounted panel.
  // The positioner only re-measures on open change / scroll / resize, so
  // nudge it through the channel it already listens to.
  useLayoutEffect(() => {
    if (open && point) window.dispatchEvent(new Event("resize"));
  }, [open, point]);

  return (
    <>
      {cloneElement(child, {
        onContextMenu: (e: MouseEvent) => {
          (child.props.onContextMenu as ((e: MouseEvent) => void) | undefined)?.(e);
          e.preventDefault();
          // An outside right-click first dismisses (pointerdown hits the
          // shared overlay stack), so this always opens fresh at the pointer.
          setPoint({ x: e.clientX, y: e.clientY });
          setOpen(true);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? contentId : undefined,
      } as Record<string, unknown>)}
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
}

ContextMenuTrigger.displayName = "ContextMenu.Trigger";
