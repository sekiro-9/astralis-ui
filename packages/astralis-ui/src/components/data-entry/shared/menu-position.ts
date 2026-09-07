"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

/**
 * Where a picker's portalled menu goes: below its anchor, or flipped above
 * when the viewport has no room below and more room above. Shared by
 * Select, Combobox, and MultiSelect so the three can never disagree about
 * collision handling.
 *
 * The menu's own height is measured from the rendered dropdown — the caller
 * passes its element (null on the first frame, when 0 keeps the menu below;
 * the layout effect re-runs with the real height before paint).
 */
export function menuPosition(
  anchor: DOMRect,
  menu: HTMLElement | null,
  gap = 4,
): { top: number; left: number; width: number } {
  const height = menu?.getBoundingClientRect().height ?? 0;
  const roomBelow = window.innerHeight - anchor.bottom - gap;
  const roomAbove = anchor.top - gap;
  const flip = height > roomBelow && roomAbove > roomBelow;

  return {
    top: flip ? Math.max(gap, anchor.top - gap - height) : anchor.bottom + gap,
    left: anchor.left,
    width: anchor.width,
  };
}

/** Keeps an open picker menu placed against its anchor through scroll,
 *  resize and filtering (which changes the menu's height). */
export function useMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
): { top: number; left: number; width: number } {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const update = useCallback(() => {
    if (!anchorRef.current) return;
    setPos(menuPosition(anchorRef.current.getBoundingClientRect(), menuRef.current));
  }, [anchorRef, menuRef]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    const observer = new ResizeObserver(update);
    if (menuRef.current) observer.observe(menuRef.current);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, update, menuRef]);

  return pos;
}
