"use client";

import { useEffect } from "react";

/**
 * The Astralis DevTools for a Next.js app. Place it once in the root layout:
 *
 *   import { AstralisDevTools } from "astralis-devtools/next";
 *   <body>{children}<AstralisDevTools /></body>
 *
 * and add the bridge's route (see "astralis-devtools/next/route"). It renders
 * nothing itself. In development it loads the overlay after hydration; in a
 * production build the branch that loads it is removed, so no DevTools code
 * reaches the client.
 */
export function AstralisDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      let unmount = null;
      let cancelled = false;
      import("../client/overlay.mjs").then(({ mountOverlay }) => {
        if (!cancelled) unmount = mountOverlay({ base: "/api/astralis-devtools", framework: "next" });
      });
      return () => {
        cancelled = true;
        unmount?.();
      };
    }
    return undefined;
  }, []);
  return null;
}
