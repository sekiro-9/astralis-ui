import { bridgeFor } from "./bridge.mjs";
import { githubSession } from "./github.mjs";
import { assembleSnapshot } from "./snapshot.mjs";

/* The bridge over HTTP, in web-standard Request/Response so the Next.js
   route handler and the Vite middleware share it. Mounted at BASE_PATH:

     GET  info          versions of astralis-ui (with the spec's SHA-256), the framework and React
     GET  spec          the installed system spec, for the component pages
     GET  findings      the validator's findings for the project
     GET  events        the same findings as a server-sent event stream, re-sent on every change
     GET  route-files   ?path=/about: the files that render that page (Next.js)
     POST snapshot      the page's part of an issue snapshot in; the complete snapshot out
     POST submit        a snapshot the reporter confirmed, opened as a GitHub issue;
                        ?addTo=12 adds it to that existing issue instead
     GET  github        the GitHub sign-in: set up or not, who, and a code to enter
     POST github/sign-in   start signing in with a code (the bridge polls GitHub)
     POST github/sign-out  forget the saved sign-in
     GET  github/issues    the issues the signed-in user opened on the Astralis repository
     POST github/similar   a snapshot in; the issues that may already report it out

   It answers the local machine only, and nothing at all in production. The
   POST routes take JSON only: a page on another site cannot send that type
   without a preflight the bridge never grants. The GitHub token never leaves
   the bridge: the page sees the login, never the token. */

export const BASE_PATH = "/api/astralis-devtools";

const KEEPALIVE_MS = 15_000;
/** A snapshot is at most 256 kB; the page's part, with a screenshot, stays well under this. */
const MAX_BODY_BYTES = 1024 * 1024;
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
/** The JSON body of a POST, or a Response explaining why it cannot be read. */
async function readJson(request) {
  if (!/^application\/json\b/i.test(request.headers.get("content-type") ?? "")) {
    return json({ error: "Send JSON (content-type: application/json)." }, 415);
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ error: "The request is too large." }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: "The request is too large." }, 413);
  try {
    return { body: JSON.parse(text) };
  } catch {
    return json({ error: "The request is not valid JSON." }, 400);
  }
}

/** A GitHub failure as a response: 401 when the reporter has to sign in (again). */
const githubFailure = (error) =>
  json({ error: error.message, code: error.code ?? "github" }, error.code === "signed-out" ? 401 : error.code === "invalid" ? 400 : 502);

const POSTS = new Set(["snapshot", "submit", "github/sign-in", "github/sign-out", "github/similar"]);

async function handlePost(bridge, path, request, github, url) {
  if (!POSTS.has(path)) return json({ error: "Not found." }, 404);
  const read = await readJson(request);
  if (read instanceof Response) return read;
  try {
    if (path === "github/sign-in") return json(await github.signIn());
    if (path === "github/sign-out") return json(github.signOut());
    if (path === "github/similar") return json(await github.similar(read.body));
  } catch (error) {
    return githubFailure(error);
  }
  if (bridge.problem) return json({ error: bridge.problem }, 409);
  if (path === "snapshot") return json(assembleSnapshot(bridge, read.body));
  const addTo = url.searchParams.has("addTo") ? Number(url.searchParams.get("addTo")) : null;
  if (addTo !== null && !(Number.isInteger(addTo) && addTo > 0)) return json({ error: "addTo takes an issue number." }, 400);
  try {
    return json(await github.submit(read.body, { addTo }));
  } catch (error) {
    return githubFailure(error);
  }
}

export async function handle(request, { root = process.cwd(), framework, watch, github = githubSession() } = {}) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  if (!isLocal(request)) return json({ error: "The Astralis DevTools bridge answers this machine only." }, 403);
  if (request.method !== "GET" && request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const bridge = bridgeFor(root, framework, { watch });
  await bridge.start();
  const url = new URL(request.url);
  if (request.method === "POST") return handlePost(bridge, route(url), request, github, url);

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
    case "github":
      return json(github.status());
    case "github/issues":
      try {
        return json({ issues: await github.issues() });
      } catch (error) {
        return githubFailure(error);
      }
    case "route-files":
      return json({ path: url.searchParams.get("path") ?? "/", files: bridge.routeFiles(url.searchParams.get("path") ?? "/") });
    default:
      return json({ error: "Not found." }, 404);
  }
}
