"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  isInHigherOverlay,
  isOverlayEventHandled,
  isTopOverlay,
  markOverlayEventHandled,
  popOverlay,
  pushOverlay,
} from "../utils/overlay-stack";

interface UseDismissOptions {
  enabled?: boolean;
  /** Refs whose subtrees are considered "inside" (won't dismiss). */
  refs: RefObject<HTMLElement | null>[];
  closeOnEscape?: boolean;
  closeOnOutsidePointer?: boolean;
  /** Tooltip-like layers that never hold focus; see `OverlayLayerOptions.transient`. */
  transient?: boolean;
}

/**
 * Non-modal dismissal for Popover, Menu, Tooltip and HoverCard: closes on
 * Escape and on pointer-down outside every provided ref. The layer joins the
 * overlay stack once per open, so Escape reaches the topmost layer only and a
 * press inside a higher layer (a Select's listbox portaled out of this
 * Popover) is not treated as outside.
 */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  { enabled = true, refs, closeOnEscape = true, closeOnOutsidePointer = true, transient = false }: UseDismissOptions,
) {
  // Callers pass inline callbacks and option literals; reading them through a
  // ref keeps the layer's stack position fixed for the whole time it is open.
  const latest = useRef({ onClose, refs, closeOnEscape, closeOnOutsidePointer });
  useLayoutEffect(() => {
    latest.current = { onClose, refs, closeOnEscape, closeOnOutsidePointer };
  });

  useEffect(() => {
    if (!open || !enabled) return;

    const isInside = (node: Node) => latest.current.refs.some((ref) => ref.current?.contains(node) ?? false);
    const overlayId = pushOverlay({ contains: isInside, transient });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !latest.current.closeOnEscape) return;
      if (isOverlayEventHandled(e) || !isTopOverlay(overlayId)) return;
      markOverlayEventHandled(e);
      latest.current.onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!latest.current.closeOnOutsidePointer) return;
      const target = e.target as Node;
      if (isInside(target) || isInHigherOverlay(overlayId, target)) return;
      latest.current.onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
      popOverlay(overlayId);
    };
  }, [open, enabled, transient]);
}
