"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { isInHigherOverlay, markOverlayEventHandled, popOverlay, pushOverlay } from "../../../utils/overlay-stack";

/**
 * An open picker listbox as a layer of the overlay stack: a press inside it
 * does not dismiss a Popover it was opened from, and a press anywhere outside
 * its refs (and outside any layer above it) calls `onOutside`.
 *
 * Capture phase on purpose: the press that dismisses a picker may also
 * unmount it, and a bubble listener would be torn down mid-propagation.
 */
export function usePickerLayer(open: boolean, refs: RefObject<HTMLElement | null>[], onOutside: () => void) {
  const latest = useRef({ refs, onOutside });
  useLayoutEffect(() => {
    latest.current = { refs, onOutside };
  });

  useEffect(() => {
    if (!open) return;
    const isInside = (node: Node) => latest.current.refs.some((ref) => ref.current?.contains(node) ?? false);
    const id = pushOverlay({ contains: isInside, transient: true });
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (isInside(target) || isInHigherOverlay(id, target)) return;
      latest.current.onOutside();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      popOverlay(id);
    };
  }, [open]);
}

/**
 * Escape that closed an open picker stops here, so the Modal or Popover the
 * picker sits in stays open.
 */
export function consumeEscape(e: KeyboardEvent) {
  e.stopPropagation();
  markOverlayEventHandled(e.nativeEvent);
}
