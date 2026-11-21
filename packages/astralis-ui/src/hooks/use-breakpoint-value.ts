"use client";

import { useEffect, useState } from "react";
import { BREAKPOINTS, BREAKPOINT_WIDTHS, type Breakpoint } from "../const/breakpoints";

/** A value per viewport breakpoint, mobile-first: each holds upward until a
 *  wider key replaces it, the same as a responsive style prop. */
export type BreakpointMap<T> = Partial<Record<"base" | Breakpoint, T>>;

/**
 * The entry of `map` that applies at the current viewport width.
 *
 * Returns `base` on the server and on the first client render, so hydration
 * always matches, then follows the viewport after mount. That one-frame lag is
 * why this is only for logic (paging, counts): anything the first paint depends
 * on must come from CSS, which already knows the width.
 */
export function useBreakpointValue<T>(map: BreakpointMap<T> & { base: T }): T {
  const [value, setValue] = useState(map.base);
  // The map is rebuilt every render; its contents are what the effect tracks.
  const key = JSON.stringify(map);

  useEffect(() => {
    const current = JSON.parse(key) as BreakpointMap<T> & { base: T };
    const queries = BREAKPOINTS.filter((bp) => current[bp] !== undefined).map(
      (bp) => [bp, window.matchMedia(`(min-width: ${BREAKPOINT_WIDTHS[bp]})`)] as const,
    );
    const update = () => {
      let next = current.base;
      for (const [bp, query] of queries) if (query.matches) next = current[bp] as T;
      setValue(next);
    };
    update();
    for (const [, query] of queries) query.addEventListener("change", update);
    return () => {
      for (const [, query] of queries) query.removeEventListener("change", update);
    };
  }, [key]);

  return value;
}
