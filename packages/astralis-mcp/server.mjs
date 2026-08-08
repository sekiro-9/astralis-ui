#!/usr/bin/env node
/**
 * Astralis UI MCP server — gives AI coding agents current component APIs
 * instead of hallucinated ones.
 *
 * Data source: the deployed docs site's machine-readable endpoints
 * (/llms.txt, /docs/components/*.md, /docs/*.md) and its block registry
 * (/r/index.json, /r/{id}.json) — the same single pipeline that renders the
 * human docs, so answers can never drift from the site.
 * Point ASTRALIS_DOCS_URL at a local dev server (http://localhost:3000)
 * when working on unpublished docs.
 *
 * Register in an MCP client:
 *   { "command": "npx", "args": ["-y", "astralis-mcp"] }
 */
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/** Single source of truth for the version — the handshake can't drift from what npm publishes. */
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const SITE = (process.env.ASTRALIS_DOCS_URL ?? "https://astralis-zeta.vercel.app").replace(/\/$/, "");

/*
 * A localhost docs URL means someone is editing docs live — never hand them a
 * stale copy. A deployed site is cached, but only briefly, so a long-lived
 * server still picks up doc updates without a restart.
 */
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/.test(SITE);
const TTL_MS = 5 * 60_000;
const FETCH_TIMEOUT_MS = 10_000;

/* ---------- data: fetched on demand, cached with a short TTL ---------- */

const cache = new Map(); // path -> { text, at }

async function fetchText(path) {
  const hit = cache.get(path);
  if (hit && !isLocal && Date.now() - hit.at < TTL_MS) return hit.text;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${SITE}${path}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} for ${SITE}${path}`);
    const text = await res.text();
    cache.set(path, { text, at: Date.now() });
    return text;
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`timed out after ${FETCH_TIMEOUT_MS}ms for ${SITE}${path}`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

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
 * The block registry, served as static JSON by the same docs deploy
 * (astralis-docs/scripts/gen-block-registry.mjs). Reusing fetchText means
 * blocks get the same cache, timeout and local-dev override as the docs.
 */
async function fetchJson(path) {
  return JSON.parse(await fetchText(path));
}

async function blockCatalogue() {
  return (await fetchJson("/r/index.json")).blocks;
}

/** One registry item, source included. Null when the id is unknown. */
async function blockItem(id) {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    return await fetchJson(`/r/${id}.json`);
  } catch {
    return null;
  }
}

async function pageMarkdown(slug, kind) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await fetchText(kind === "guide" ? `/docs/${slug}.md` : `/docs/components/${slug}.md`);
  } catch {
    return null;
  }
}

const asText = (text) => ({ content: [{ type: "text", text }] });
const asError = (text) => ({ content: [{ type: "text", text }], isError: true });
const offline = (err) =>
  asError(`Could not reach the Astralis docs at ${SITE} (${err.message}). Check your connection, or set ASTRALIS_DOCS_URL.`);

/* ---------- server ---------- */

const server = new McpServer({ name: "astralis-ui", version: pkg.version });

server.tool(
  "list_components",
  "List every Astralis UI docs page — all components plus every guide — each with slug, one-line description, category, and kind (component | guide). Call this first to discover valid slugs.",
  {},
  async () => {
    try {
      return asText(JSON.stringify(await listPages(), null, 2));
    } catch (err) {
      return offline(err);
    }
  },
);

server.tool(
  "get_component",
  "Full documentation for one component as markdown: usage, complete props table, keyboard/accessibility notes, and runnable demo source code. Use the slug from list_components.",
  { slug: z.string().describe("Component docs slug, e.g. 'button', 'number-input'") },
  async ({ slug }) => {
    try {
      const md = await pageMarkdown(slug, "component");
      return md
        ? asText(md)
        : asError(`Unknown component "${slug}". Call list_components for valid slugs.`);
    } catch (err) {
      return offline(err);
    }
  },
);

server.tool(
  "get_guide",
  "One Astralis guide page as markdown — e.g. installation, theming, tokens. Use a guide slug from list_components for the full set.",
  { slug: z.string().describe("Guide slug, e.g. 'installation', 'theming', 'tokens'") },
  async ({ slug }) => {
    try {
      const md = await pageMarkdown(slug, "guide");
      if (md) return asText(md);
      const guides = (await listPages()).filter((p) => p.kind === "guide").map((p) => p.slug);
      return asError(`Unknown guide "${slug}". Valid guides: ${guides.join(", ")}.`);
    } catch (err) {
      return offline(err);
    }
  },
);

server.tool(
  "search_docs",
  "Full-text search across all Astralis documentation (guides + components). Returns matching pages with a snippet around the first hit.",
  { query: z.string().describe("Search text, e.g. 'focus trap' or 'aria-describedby'") },
  async ({ query }) => {
    try {
      const q = query.toLowerCase();
      const hits = [];
      for (const page of await listPages()) {
        const md = (await pageMarkdown(page.slug, page.kind)) ?? "";
        const idx = md.toLowerCase().indexOf(q);
        if (idx === -1) continue;
        hits.push({ ...page, snippet: md.slice(Math.max(0, idx - 80), idx + 120).replace(/\s+/g, " ") });
      }
      return asText(hits.length ? JSON.stringify(hits, null, 2) : "No matches.");
    } catch (err) {
      return offline(err);
    }
  },
);

server.tool(
  "get_theming",
  "The complete Astralis theming reference: the token system, dark mode, runtime brand color, colorScheme/accent channel, plus every design-token scale (spacing, sizing, type, radius, shadows, motion).",
  {},
  async () => {
    try {
      const [theming, tokens] = await Promise.all([
        pageMarkdown("theming", "guide"),
        pageMarkdown("tokens", "guide"),
      ]);
      return asText([theming ?? "", "\n---\n", tokens ?? ""].join("\n"));
    } catch (err) {
      return offline(err);
    }
  },
);

/* ---------- blocks ---------- */

server.tool(
  "list_blocks",
  "List every Astralis block — prebuilt page sections (hero, pricing, dashboard, login…) composed from Astralis UI components. Each entry has id, name, description, category and the components it composes. Call this first to discover valid block ids. Pass a category to narrow the list.",
  {
    category: z
      .string()
      .optional()
      .describe("Optional filter, e.g. 'hero', 'pricing', 'dashboard', 'login'"),
  },
  async ({ category }) => {
    try {
      const blocks = await blockCatalogue();
      if (!category) return asText(JSON.stringify(blocks, null, 2));

      const wanted = category.toLowerCase();
      const filtered = blocks.filter((b) => b.category === wanted);
      if (filtered.length) return asText(JSON.stringify(filtered, null, 2));

      const categories = [...new Set(blocks.map((b) => b.category))].sort();
      return asError(`No blocks in category "${category}". Categories: ${categories.join(", ")}.`);
    } catch (err) {
      return offline(err);
    }
  },
);

server.tool(
  "get_block",
  "One Astralis block: its metadata plus the complete source of every file it contains, ready to write into a project. A block depends only on astralis-ui — no other packages, no Tailwind config, no per-block setup. Use an id from list_blocks.",
  { id: z.string().describe("Block id, e.g. 'hero-01', 'pricing-02', 'dashboard-03'") },
  async ({ id }) => {
    try {
      const block = await blockItem(id);
      if (!block) {
        const ids = (await blockCatalogue()).map((b) => b.id);
        return asError(`Unknown block "${id}". Valid ids: ${ids.join(", ")}.`);
      }

      /*
       * Markdown rather than raw JSON: the payload is mostly source code, and
       * fenced blocks keep an agent from having to unescape a JSON string
       * before it can write the file.
       */
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
        `Install with \`astralis add ${block.id}\`, or write the files below yourself —`,
        `they belong to the project once copied. The only dependency is \`astralis-ui\`.`,
        "",
      ];

      for (const file of block.contents) {
        const lang = file.path.endsWith(".tsx") || file.path.endsWith(".ts") ? "tsx" : "";
        sections.push(`## ${file.path}`, "", `\`\`\`${lang}`, file.content.trimEnd(), "```", "");
      }

      return asText(sections.join("\n"));
    } catch (err) {
      return offline(err);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
