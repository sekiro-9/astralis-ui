import { bridgeFor } from "./bridge.mjs";

/* The bridge over HTTP, in web-standard Request/Response so the Next.js
   route handler and the Vite middleware share it. Mounted at BASE_PATH:

     GET info          versions of astralis-ui (with the spec's SHA-256), the framework and React
     GET spec          the installed system spec, for the Inspect panel
     GET findings      the validator's findings for the project
     GET events        the same findings as a server-sent event stream, re-sent on every change
     GET route-files   ?path=/about: the files that render that page (Next.js)

   It answers the local machine only, and nothing at all in production. */

export const BASE_PATH = "/api/astralis-devtools";

const KEEPALIVE_MS = 15_000;
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/**
 * A request from this machine: addressed to a loopback host and, when a page
 * sent it, from a loopback page. A dev server opened to the network
 * (`next dev -H 0.0.0.0`) still refuses the bridge to other machines, and a
 * page on another site cannot read it by pointing a DNS name at 127.0.0.1.
 */
export function isLocal(request) {
  const hostname = (value) => {
    try {
      return new URL(value).hostname;
    } catch {
      return null;
    }
  };
  const host = request.headers.get("host");
  if (!host || !LOOPBACK.has(hostname(`http://${host}`))) return false;
  const origin = request.headers.get("origin");
  return origin === null || LOOPBACK.has(hostname(origin));
}

/** The path after BASE_PATH, e.g. "findings". */
function route(url) {
  const at = url.pathname.indexOf(BASE_PATH);
  const rest = at === -1 ? url.pathname : url.pathname.slice(at + BASE_PATH.length);
  return rest.replace(/^\/+|\/+$/g, "");
}

function eventStream(bridge, signal) {
  const encoder = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (text) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          stop();
        }
      };
      const publish = (findings) => send(`event: findings\ndata: ${JSON.stringify(findings)}\n\n`);
      const unlisten = bridge.listen(publish);
      const keepalive = setInterval(() => send(": keepalive\n\n"), KEEPALIVE_MS);
      stop = () => {
        unlisten();
        clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          // already closed by the client
        }
      };
      signal?.addEventListener("abort", stop, { once: true });
      publish(bridge.findings());
    },
    cancel() {
      stop();
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

/**
 * Answer one request. `root` is the project directory, `framework` "next" or
 * "vite"; `watch` optionally replaces fs.watch (Vite passes its own watcher).
 */
export async function handle(request, { root = process.cwd(), framework, watch } = {}) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  if (!isLocal(request)) return json({ error: "The Astralis DevTools bridge answers this machine only." }, 403);
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);

  const bridge = bridgeFor(root, framework, { watch });
  await bridge.start();
  const url = new URL(request.url);

  switch (route(url)) {
    case "info":
      return bridge.problem ? json({ problem: bridge.problem }) : json(bridge.info);
    case "spec":
      return bridge.problem
        ? json({ problem: bridge.problem }, 404)
        : new Response(bridge.specText, {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
    case "findings":
      return json(bridge.findings());
    case "events":
      return eventStream(bridge, request.signal);
    case "route-files":
      return json({ path: url.searchParams.get("path") ?? "/", files: bridge.routeFiles(url.searchParams.get("path") ?? "/") });
    default:
      return json({ error: "Not found." }, 404);
  }
}
