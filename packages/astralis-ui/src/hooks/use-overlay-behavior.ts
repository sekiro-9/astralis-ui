"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  isOverlayEventHandled,
  isTopOverlay,
  lockBodyScroll,
  markOverlayEventHandled,
  popOverlay,
  pushOverlay,
  unlockBodyScroll,
} from "../utils/overlay-stack";

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "summary",
  "[contenteditable]:not([contenteditable=false])",
  "[tabindex]:not([disabled])",
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(",");

/**
 * Focusable descendants a Tab can actually reach. A collapsed Accordion panel
 * or an inactive Tabs panel is `hidden` or `inert`; trapping onto one of them
 * would let the next Tab leave the dialog.
 */
export function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.closest("[inert], [hidden]")) return false;
    // Catches display:none and visibility:hidden; absent in jsdom.
    return typeof el.checkVisibility === "function" ? el.checkVisibility({ visibilityProperty: true }) : true;
  });
}

export interface UseOverlayBehaviorOptions {
  /** Whether pressing Escape closes the overlay. @default true */
  closeOnEsc?: boolean;
}

/**
 * Modal behaviour for Modal, Drawer and the image lightbox: body scroll lock,
 * initial focus, focus return on close, a Tab trap and Escape to close, all
 * coordinated with the shared overlay stack.
 *
 * @returns containerRef — attach to the dialog panel element
 */
export function useOverlayBehavior(
  open: boolean,
  setOpen: (open: boolean) => void,
  options: UseOverlayBehaviorOptions = {},
) {
  const { closeOnEsc = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);

  // The effect below must run once per open: re-running it refocuses the first
  // field, so an inline `onOpenChange` would steal focus on every keystroke.
  const latest = useRef({ setOpen, closeOnEsc });
  useLayoutEffect(() => {
    latest.current = { setOpen, closeOnEsc };
  });

  useEffect(() => {
    if (!open) return;

    const overlayId = pushOverlay({
      contains: (node) => containerRef.current?.contains(node) ?? false,
    });
    lockBodyScroll();

    const previousFocus = document.activeElement as HTMLElement | null;

    // Deferred so the portal has rendered.
    const focusTimer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      (getTabbable(container)[0] ?? container).focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isOverlayEventHandled(e) || !isTopOverlay(overlayId)) return;
        markOverlayEventHandled(e);
        if (latest.current.closeOnEsc) latest.current.setOpen(false);
        return;
      }

      if (e.key === "Tab" && isTopOverlay(overlayId, { ignoreTransient: true })) {
        const container = containerRef.current;
        if (!container) return;
        const tabbable = getTabbable(container);
        if (tabbable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = tabbable[0];
        const last = tabbable[tabbable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === container)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popOverlay(overlayId);
      unlockBodyScroll();
      clearTimeout(focusTimer);
      previousFocus?.focus();
    };
  }, [open]);

  return { containerRef };
}
