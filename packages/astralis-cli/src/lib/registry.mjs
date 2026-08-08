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
  const base = flag ?? process.env.ASTRALIS_REGISTRY ?? DEFAULT_REGISTRY;
  return base.replace(/\/+$/, "");
}

async function getJson(url) {
  let response;
  try {
    response = await fetch(url);
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
    fail(`Registry returned invalid JSON for ${url}`);
  }
}

/** The catalogue: every block, without source. */
export async function fetchIndex(base) {
  const data = await getJson(`${base}/index.json`);
  if (!data) fail(`No block catalogue at ${base}/index.json`);
  return data;
}

/** One block, with the full text of its files. Null when the id is unknown. */
export function fetchBlock(base, id) {
  return getJson(`${base}/${id}.json`);
}
