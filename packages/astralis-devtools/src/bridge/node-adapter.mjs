import { handle } from "./http.mjs";

/* The bridge as Node middleware (Vite's dev server is Connect): turn the
   IncomingMessage into a web Request, answer it, and stream the Response back,
   event stream included. */

const LOOPBACK_ADDRESS = /^(127\.|::1$|::ffff:127\.)/;

/**
 * Middleware for `server.middlewares.use(BASE_PATH, middleware)`. `options`
 * are handle()'s: root, framework and watch. The socket must come from this
 * machine as well; in Node that is known directly, not only from headers.
 */
export function bridgeMiddleware(options) {
  return async (req, res, next) => {
    try {
      if (!LOOPBACK_ADDRESS.test(req.socket?.remoteAddress ?? "")) {
        res.statusCode = 403;
        res.end();
        return;
      }
      const controller = new AbortController();
      res.on("close", () => controller.abort());
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(", "));
      }
      const url = new URL(req.originalUrl ?? req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const response = await handle(new Request(url, { method: req.method, headers, signal: controller.signal }), options);

      res.statusCode = response.status;
      response.headers.forEach((value, name) => res.setHeader(name, value));
      if (!response.body) {
        res.end();
        return;
      }
      res.flushHeaders?.();
      const reader = response.body.getReader();
      res.on("close", () => reader.cancel().catch(() => {}));
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error) {
      next(error);
    }
  };
}
