import { bridgeFor } from "./bridge/bridge.mjs";
import { BASE_PATH } from "./bridge/http.mjs";
import { bridgeMiddleware } from "./bridge/node-adapter.mjs";

/**
 * The module index.html loads to start the overlay. It is served by this
 * plugin rather than written inline: Vite resolves the bare import in a module
 * it serves, but not in an inline script a plugin injects into the page.
 */
export const ENTRY_URL = "/@astralis-devtools/entry.js";
const ENTRY_SOURCE = `import { mountOverlay } from "astralis-devtools/client";
mountOverlay({ base: ${JSON.stringify(BASE_PATH)}, framework: "vite" });
`;

/**
 * The Astralis DevTools for a Vite project:
 *
 *   // vite.config.ts
 *   import { astralisDevtools } from "astralis-devtools/vite";
 *   export default defineConfig({ plugins: [react(), astralisDevtools()] });
 *
 * `apply: "serve"` keeps it out of `vite build` entirely: the overlay is
 * injected into index.html and the bridge mounted on the dev server only.
 */
export function astralisDevtools() {
  let root = process.cwd();
  return {
    name: "astralis-devtools",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === ENTRY_URL ? ENTRY_URL : null;
    },
    load(id) {
      return id === ENTRY_URL ? ENTRY_SOURCE : null;
    },
    configureServer(server) {
      // Vite already watches the project; the bridge listens to that watcher
      // instead of opening a second one.
      const watch = (onChange) => {
        const events = ["add", "change", "unlink"];
        for (const event of events) server.watcher.on(event, onChange);
        return () => {
          for (const event of events) server.watcher.off(event, onChange);
        };
      };
      server.middlewares.use(BASE_PATH, bridgeMiddleware({ root, framework: "vite", watch }));
      // Validate while the server starts, so the first page load has findings waiting.
      bridgeFor(root, "vite", { watch })
        .start()
        .catch((error) => server.config.logger.warn(`[astralis-devtools] ${error.message}`));
    },
    transformIndexHtml() {
      return [{ tag: "script", attrs: { type: "module", src: ENTRY_URL }, injectTo: "body" }];
    },
  };
}
