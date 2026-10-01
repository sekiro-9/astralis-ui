#!/usr/bin/env node
/**
 * Astralis UI MCP server — gives AI coding agents current component APIs
 * instead of hallucinated ones, and a validator to judge what they write:
 * retrieval AND verification (validate_code), so an agent can close its own
 * write -> validate -> fix loop against the design system's ground truth.
 *
 * Data source: the deployed docs site's machine-readable endpoints
 * (/llms.txt, /llms-full.txt, /docs/components/*.md, /docs/*.md,
 * /system-spec.json) and its block registry (/r/index.json, /r/{id}.json),
 * the same pipeline that renders the human docs. Point ASTRALIS_DOCS_URL at a
 * local dev server (http://localhost:3000) when working on unpublished docs.
 *
 * Register in an MCP client:
 *   { "command": "npx", "args": ["-y", "astralis-mcp"] }
 */
import { readFileSync, statSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prepareSpec, validateSource, findInstalledSpec } from "astralis-cli/validate";

/** Single source of truth for the version — the handshake can't drift from what npm publishes. */
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const SITE = (process.env.ASTRALIS_DOCS_URL ?? "https://astralis-ui.com").replace(/\/$/, "");

/*
 * A localhost docs URL means someone is editing docs live, so nothing is
 * cached. A deployed site is cached briefly, so a long-lived server still
 * picks up doc updates without a restart.
 */
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/.test(SITE);
const TTL_MS = 5 * 60_000;
const FETCH_TIMEOUT_MS = 10_000;
/** Remote text goes straight into an agent's context: anything bigger than this is refused. */
const MAX_RESPONSE_BYTES = 5_000_000;

/* ---------- data: fetched on demand, cached with a short TTL ---------- */

/** The site answered, but not with the page: `status` tells a missing page (404) from a broken one. */
class HttpError extends Error {
  constructor(status, url) {
    super(`${status} for ${url}`);
    this.status = status;
  }
}

class TooLargeError extends Error {}

const cache = new Map(); // path -> { text, at }

async function readCapped(response, url) {
  const declared = Number(response.headers.get("content-length"));
  if (declared > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new TooLargeError(`${url} is larger than ${MAX_RESPONSE_BYTES} bytes`);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > MAX_RESPONSE_BYTES) throw new TooLargeError(`${url} is larger than ${MAX_RESPONSE_BYTES} bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function fetchText(path) {
  const hit = cache.get(path);
  if (hit && !isLocal && Date.now() - hit.at < TTL_MS) return hit.text;

  const url = `${SITE}${path}`;
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      await res.body?.cancel();
      throw new HttpError(res.status, url);
    }
    const text = await readCapped(res, url);
    cache.set(path, { text, at: Date.now() });
    return text;
  } catch (err) {
    if (signal.aborted) throw new Error(`timed out after ${FETCH_TIMEOUT_MS}ms for ${url}`);
    throw err;
  }
}

/** A page's text, or null when the site says it doesn't exist. Any other failure throws. */
async function fetchOptional(path) {
  try {
    return await fetchText(path);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
}

const SLUG = /^[a-z0-9-]+$/;

/** Parse llms.txt into [{slug, title, description, section, kind}]. */
async function listPages() {
  const index = await fetchText("/llms.txt");
  const pages = [];
  let section = "";
  for (const line of index.split("\n")) {
    const heading = line.match(/^## (.+)$/);
    if (heading) section = heading[1];
    const item = line.match(/^- \[([^\]]+)\]\(\S*\/docs\/(?:(components)\/)?([a-z0-9-]+)\.md\):\s*(.*)$/);
    if (!item) continue;
    pages.push({
      slug: item[3],
      title: item[1],
      description: item[4],
      section,
      kind: item[2] ? "component" : "guide",
    });
  }
  return pages;
}

/**
 * llms-full.txt split back into pages. Each page opens with a marker
 * `<!-- Section / Title — /docs/[components/]slug -->` (astralis-docs
 * src/app/llms-full.txt/route.ts).
 */
async function corpusPages() {
  const corpus = await fetchText("/llms-full.txt");
  const marker = /^<!-- .+ — \/docs\/(?:(components)\/)?([a-z0-9-]+) -->$/gm;
  const found = [...corpus.matchAll(marker)];
  return found.map((m, i) => ({
    slug: m[2],
    kind: m[1] ? "component" : "guide",
    body: corpus.slice(m.index + m[0].length, found[i + 1]?.index ?? corpus.length),
  }));
}

async function pageMarkdown(slug, kind) {
  if (!SLUG.test(slug)) return null;
  return fetchOptional(kind === "guide" ? `/docs/${slug}.md` : `/docs/components/${slug}.md`);
}

async function fetchJson(path) {
  return JSON.parse(await fetchText(path));
}

async function blockCatalogue() {
  return (await fetchJson("/r/index.json")).blocks;
}

/** One registry item, source included. Null when the id is unknown. */
async function blockItem(id) {
  if (!SLUG.test(id)) return null;
  const text = await fetchOptional(`/r/${id}.json`);
  return text === null ? null : JSON.parse(text);
}

const asText = (text) => ({ content: [{ type: "text", text }] });
const asError = (text) => ({ content: [{ type: "text", text }], isError: true });
/** A fetch that failed, as an error result: never mistaken for "unknown" or an empty answer. */
const offline = (err) =>
  err instanceof HttpError
    ? asError(`The Astralis docs at ${SITE} answered ${err.message}. Try again later, or set ASTRALIS_DOCS_URL.`)
    : err instanceof TooLargeError
      ? asError(`Refused a response from the Astralis docs: ${err.message}.`)
      : asError(`Could not reach the Astralis docs at ${SITE} (${err.message}). Check your connection, or set ASTRALIS_DOCS_URL.`);

/* ---------- server ---------- */

const server = new McpServer({ name: "astralis-ui", version: pkg.version });

/** Every tool only reads; the docs ones read from the web. A failed fetch is always an error result. */
function tool(name, { title, description, inputSchema = {} }, handler) {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        return await handler(args);
      } catch (err) {
        return offline(err);
      }
    },
  );
}

tool(
  "list_components",
  {
    title: "List docs pages",
    description:
      "List every Astralis UI docs page — all components plus every guide — each with slug, title, one-line description, section, and kind (component | guide). Call this first to discover valid slugs.",
  },
  async () => asText(JSON.stringify(await listPages(), null, 2)),
);

tool(
  "get_component",
  {
    title: "Get component docs",
    description:
      "Full documentation for one component as markdown: usage, complete props table, keyboard/accessibility notes, and runnable demo source code. Use the slug from list_components.",
    inputSchema: { slug: z.string().describe("Component docs slug, e.g. 'button', 'number-input'") },
  },
  async ({ slug }) => {
    const md = await pageMarkdown(slug, "component");
    return md ? asText(md) : asError(`Unknown component "${slug}". Call list_components for valid slugs.`);
  },
);

tool(
  "get_guide",
  {
    title: "Get a guide",
    description:
      "One Astralis guide page as markdown — e.g. installation, theming, tokens. Use a guide slug from list_components for the full set.",
    inputSchema: { slug: z.string().describe("Guide slug, e.g. 'installation', 'theming', 'tokens'") },
  },
  async ({ slug }) => {
    const md = await pageMarkdown(slug, "guide");
    if (md) return asText(md);
    const guides = (await listPages()).filter((p) => p.kind === "guide").map((p) => p.slug);
    return asError(`Unknown guide "${slug}". Valid guides: ${guides.join(", ")}.`);
  },
);

tool(
  "search_docs",
  {
    title: "Search the docs",
    description:
      "Full-text search across all Astralis documentation (guides + components). Returns matching pages with a snippet around the first hit.",
    inputSchema: { query: z.string().describe("Search text, e.g. 'focus trap' or 'aria-describedby'") },
  },
  async ({ query }) => {
    const q = query.toLowerCase();
    const [pages, index] = await Promise.all([corpusPages(), listPages()]);
    const meta = new Map(index.map((p) => [`${p.kind}:${p.slug}`, p]));
    const hits = [];
    for (const page of pages) {
      const idx = page.body.toLowerCase().indexOf(q);
      if (idx === -1) continue;
      const { title = page.slug, description = "", section = "" } = meta.get(`${page.kind}:${page.slug}`) ?? {};
      const snippet = page.body.slice(Math.max(0, idx - 80), idx + 120).replace(/\s+/g, " ").trim();
      hits.push({ slug: page.slug, title, description, section, kind: page.kind, snippet });
    }
    return asText(hits.length ? JSON.stringify(hits, null, 2) : "No matches.");
  },
);

tool(
  "get_theming",
  {
    title: "Get the theming reference",
    description:
      "The complete Astralis theming reference: the token system, dark mode, runtime brand color, colorScheme/accent channel, plus every design-token scale (spacing, sizing, type, radius, shadows, motion).",
  },
  async () => {
    const [theming, tokens] = await Promise.all([pageMarkdown("theming", "guide"), pageMarkdown("tokens", "guide")]);
    const missing = [!theming && "theming", !tokens && "tokens"].filter(Boolean);
    if (missing.length) return asError(`The docs site has no ${missing.join(" or ")} page, so the reference is incomplete.`);
    return asText([theming, "\n---\n", tokens].join("\n"));
  },
);

/* ---------- blocks ---------- */

tool(
  "list_blocks",
  {
    title: "List blocks",
    description:
      "List every Astralis block — prebuilt page sections (hero, pricing, dashboard, login…) composed from Astralis UI components. Each entry has id, name, description, category and the components it composes. Call this first to discover valid block ids. Pass a category to narrow the list.",
    inputSchema: {
      category: z.string().optional().describe("Optional filter, e.g. 'hero', 'pricing', 'dashboard', 'login'"),
    },
  },
  async ({ category }) => {
    const blocks = await blockCatalogue();
    if (!category) return asText(JSON.stringify(blocks, null, 2));

    const filtered = blocks.filter((b) => b.category === category.toLowerCase());
    if (filtered.length) return asText(JSON.stringify(filtered, null, 2));

    const categories = [...new Set(blocks.map((b) => b.category))].sort();
    return asError(`No blocks in category "${category}". Categories: ${categories.join(", ")}.`);
  },
);

tool(
  "get_block",
  {
    title: "Get a block's source",
    description:
      "One Astralis block: its metadata plus the complete source of every file it contains, ready to write into a project. A block depends only on astralis-ui — no other packages, no Tailwind config, no per-block setup. Use an id from list_blocks.",
    inputSchema: { id: z.string().describe("Block id, e.g. 'hero-01', 'pricing-02', 'dashboard-03'") },
  },
  async ({ id }) => {
    const block = await blockItem(id);
    if (!block) {
      const ids = (await blockCatalogue()).map((b) => b.id);
      return asError(`Unknown block "${id}". Valid ids: ${ids.join(", ")}.`);
    }

    // Markdown, not JSON: the payload is mostly source, and fenced blocks
    // spare the agent unescaping a JSON string before writing the file.
    const sections = [
      `# ${block.name}`,
      "",
      block.description,
      "",
      `- **id** \`${block.id}\`  ·  **category** \`${block.category}\``,
      `- **exports** \`${block.component}\``,
      `- **composes** ${block.uses.map((u) => `\`${u}\``).join(", ")}`,
      `- **preview** ${SITE}/blocks/${block.id}`,
      "",
      `Install with \`npx astralis-cli add ${block.id}\`, or write the files below yourself —`,
      `they belong to the project once copied. The only dependency is \`astralis-ui\`.`,
      "",
    ];
    for (const file of block.contents) {
      const lang = file.path.endsWith(".tsx") || file.path.endsWith(".ts") ? "tsx" : "";
      sections.push(`## ${file.path}`, "", `\`\`\`${lang}`, file.content.trimEnd(), "```", "");
    }
    return asText(sections.join("\n"));
  },
);

/* ---------- validation ---------- */

/*
 * The judge half of verified generation: pure local computation, no model.
 * The spec comes from the project's own installed astralis-ui (the version
 * the code must conform to); with none nearby (a desktop client spawned at
 * $HOME) it falls back to the spec of the version the docs site documents.
 */
let specState = null; // { key, prepared, version, source }

async function resolveSpec() {
  const localPath = findInstalledSpec(process.cwd());
  if (localPath) {
    const key = `${localPath}@${statSync(localPath).mtimeMs}`;
    if (specState?.key !== key) {
      const spec = JSON.parse(readFileSync(localPath, "utf8"));
      specState = { key, prepared: prepareSpec(spec), version: spec.version, source: "installed astralis-ui" };
    }
    return specState;
  }
  // fetchText's TTL decides freshness; re-prepare only when the text changed.
  const text = await fetchText("/system-spec.json");
  if (specState?.key !== text) {
    const spec = JSON.parse(text);
    specState = {
      key: text,
      prepared: prepareSpec(spec),
      version: spec.version,
      source: `docs site (${SITE}) — no local astralis-ui found, validated against the latest published version`,
    };
  }
  return specState;
}

tool(
  "validate_code",
  {
    title: "Validate Astralis code",
    description:
      "Validate Astralis UI TSX/JSX against the design system's machine-readable spec. Catches what typechecking cannot: components and compound parts that don't exist, prop values outside their token sets, astralis:* classes missing from the compiled CSS (they render as nothing), undeclared token variables, illegal breakpoint/state keys, broken compound anatomy, Tabs trigger/panel mismatches, and a11y mistakes (typo'd aria-* attributes, invalid roles, missing alt). ALWAYS run this on Astralis code you generate or edit BEFORE presenting it; fix every error, then validate again until clean. Errors include the valid alternatives, so they are directly actionable.",
    inputSchema: {
      code: z
        .string()
        .describe("The complete TSX/JSX source to validate (a whole file or a self-contained snippet with its astralis-ui imports)"),
      strict_tokens: z
        .boolean()
        .optional()
        .describe("Also warn on valid-but-off-token colors (design-system drift check). Default false."),
    },
  },
  async ({ code, strict_tokens }) => {
    const spec = await resolveSpec();
    const { errors, warnings } = validateSource(code, spec.prepared, "<code>", { strictTokens: strict_tokens ?? false });
    const valid = errors.length === 0;
    return {
      content: [{
        type: "text",
        text: JSON.stringify(
          {
            valid,
            spec: { version: spec.version, source: spec.source },
            summary: valid
              ? `valid against astralis-ui@${spec.version}${warnings.length ? ` (${warnings.length} warning(s))` : ""}`
              : `${errors.length} error(s), ${warnings.length} warning(s) — fix the errors and validate again`,
            errors,
            warnings,
          },
          null,
          2,
        ),
      }],
      isError: false,
    };
  },
);

await server.connect(new StdioServerTransport());
