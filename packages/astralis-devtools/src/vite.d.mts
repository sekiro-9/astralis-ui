/** Structurally a Vite plugin; typed loosely so this package needs no Vite types. */
export interface AstralisDevtoolsPlugin {
  name: "astralis-devtools";
  apply: "serve";
  [hook: string]: unknown;
}

/**
 * The Astralis DevTools for a Vite project. Dev server only: injects the
 * overlay into index.html and serves the bridge. `vite build` never sees it.
 */
export function astralisDevtools(): AstralisDevtoolsPlugin;
