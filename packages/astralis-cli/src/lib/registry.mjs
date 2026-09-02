import { isAbsolute, resolve, sep } from "node:path";
import { fail } from "./ui.mjs";

/**
 * The block registry lives on the docs site as static JSON — see
 * astralis-docs/scripts/gen-block-registry.mjs. Fetching it rather than
 * bundling it into this package keeps the two on separate clocks: adding a
 * block is a docs deploy, not a CLI release.
 *
 * --registry (or ASTRALIS_REGISTRY) points at a different host, which is how
 * the registry gets tested against a local docs server before it ships.
 */

const DEFAULT_REGISTRY = "https://astralis-zeta.vercel.app/r";

export function registryBase(flag) {
  const base = flag ?? (process.env.ASTRALIS_REGISTRY || DEFAULT_REGISTRY);
  return base.replace(/\/+$/, "");
}

export const REGISTRY_TIMEOUT_MS = 10_000;

/** fetch() that gives up after `ms`, body read included, with a readable error. */
export async function fetchWithTimeout(url, ms = REGISTRY_TIMEOUT_MS) {
  const signal = AbortSignal.timeout(ms);
  try {
    return { response: await fetch(url, { signal }), signal };
  } catch (error) {
    throw signal.aborted ? new Error(`timed out after ${ms / 1000}s`) : error;
  }
}

async function getJson(url) {
  let response;
  let signal;
  try {
    ({ response, signal } = await fetchWithTimeout(url));
  } catch (error) {
    fail(`Could not reach the block registry at ${url}\n  ${error.message}`);
  }
  // Cancel the body on any path that will not read it. An undici response left
  // unconsumed keeps its socket handle open, and a process.exit() while that
  // handle is live trips a libuv assertion on Windows — the CLI printed a
  // correct error and then crashed underneath it.
  if (response.status === 404) {
    await response.body?.cancel();
    return null;
  }
  if (!response.ok) {
    await response.body?.cancel();
    fail(`Registry responded ${response.status} for ${url}`);
  }
  try {
    return await response.json();
  } catch {
    fail(signal.aborted ? `Registry timed out sending ${url}` : `Registry returned invalid JSON for ${url}`);
  }
}

/** The catalogue: every block, without source. */
export async function fetchIndex(base) {
  const data = await getJson(`${base}/index.json`);
  if (!data) fail(`No block catalogue at ${base}/index.json`);
  return data;
}

/** Block ids are what the registry builder emits: lowercase words and dashes. */
export function isBlockId(id) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}

/**
 * Where a registry file may be written: inside `target`, or nowhere. The
 * registry is remote input, so a path that is absolute or climbs out with
 * `..` is refused rather than normalised. Returns the absolute path, or null.
 */
export function resolveBlockFile(target, filePath) {
  if (typeof filePath !== "string" || filePath === "" || filePath.includes("\0")) return null;
  if (isAbsolute(filePath) || /^[\\/]|^[a-z]:/i.test(filePath)) return null;
  if (filePath.split(/[\\/]/).some((segment) => segment === ".." || segment === "")) return null;
  const root = resolve(target);
  const full = resolve(root, filePath);
  return full.startsWith(root + sep) ? full : null;
}

/** One block, with the full text of its files. Null when the id is unknown. */
export function fetchBlock(base, id) {
  return getJson(`${base}/${id}.json`);
}
