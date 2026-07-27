"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query.
 *
 * `useSyncExternalStore` rather than an effect: matchMedia is an external
 * store, the server has no snapshot for it, and this is the hook that
 * reconciles those two facts without a setState-in-effect cascade.
 *
 * The server snapshot is `false`, so prerendered HTML is the mobile-first
 * layout and wider viewports upgrade on hydration. Use it for things CSS
 * genuinely cannot express — a component prop that changes structure, not
 * styling that a breakpoint class would handle.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
