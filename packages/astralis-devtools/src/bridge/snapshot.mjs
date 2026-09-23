import {
  ISSUES_ORIGIN,
  LIMITS,
  SNAPSHOT_FORMAT,
  checkSnapshot,
  cleanConsoleMessage,
  cleanRoute,
  narrowTree,
  submitDraft,
} from "astralis-cli/snapshot";

/* The bridge's half of an issue snapshot. The page sends what only the page
   knows (the component tree, the browser, the reporter's words); the bridge
   adds what only the dev server knows (versions, the spec's hash, the
   validator's findings) and checks the whole. Nothing here makes a network
   request except submit(), which runs only when the reporter confirms. */

const shortString = (value, max) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined);

/** Findings for the files that render `route` (Next.js), else for the whole project. */
function findingsFor(bridge, route) {
  const { results = [] } = bridge.findings();
  const files = route ? new Set(bridge.routeFiles(route)) : new Set();
  const chosen = files.size ? results.filter((r) => files.has(r.file)) : results;
  return chosen
    .flatMap((r) => [...r.errors, ...r.warnings])
    .map(({ code, file, line, column, message }) => ({ code, file, line, column, message }))
    .slice(0, LIMITS.findings);
}

function environmentOf(info, input) {
  const env = input && typeof input === "object" ? input : {};
  const viewport = env.viewport;
  return {
    framework: { name: info.framework?.name ?? null, version: info.framework?.version ?? null },
    react: info.react ?? null,
    browser: shortString(env.browser, 60) ?? null,
    viewport: viewport && Number.isInteger(viewport.width) && Number.isInteger(viewport.height)
      ? { width: viewport.width, height: viewport.height }
      : null,
    colorMode: env.colorMode === "light" || env.colorMode === "dark" ? env.colorMode : null,
  };
}

/**
 * The complete snapshot from the page's part. Returns { snapshot, problems }:
 * the overlay shows `snapshot` as the exact JSON that would be sent.
 */
export function assembleSnapshot(bridge, input = {}) {
  const include = input.include ?? {};
  const route = cleanRoute(typeof input.route === "string" ? input.route : null);
  const description = { title: shortString(input.description?.title, LIMITS.title) ?? "" };
  const happened = shortString(input.description?.happened, LIMITS.body);
  const expected = shortString(input.description?.expected, LIMITS.body);
  if (happened) description.happened = happened;
  if (expected) description.expected = expected;

  const snapshot = {
    format: SNAPSHOT_FORMAT,
    source: "devtools",
    library: { ...bridge.info.library },
    environment: environmentOf(bridge.info, input.environment),
    route,
    tree: narrowTree(bridge.spec, input.tree),
    ...(include.findings === false ? {} : { findings: findingsFor(bridge, route) }),
    ...(include.console && Array.isArray(input.console)
      ? { console: input.console.slice(-LIMITS.console).map((m) => cleanConsoleMessage(m)) }
      : {}),
    ...(include.screenshot && typeof input.screenshot === "string" ? { screenshot: input.screenshot } : {}),
    description,
  };
  return { snapshot, problems: checkSnapshot(snapshot) };
}

/** Send a snapshot the reporter confirmed. Resolves to the draft's URL. */
export function submit(snapshot, { origin = process.env.ASTRALIS_ISSUES_URL || ISSUES_ORIGIN, fetchImpl } = {}) {
  return submitDraft(snapshot, { origin, ...(fetchImpl ? { fetchImpl } : {}) });
}
