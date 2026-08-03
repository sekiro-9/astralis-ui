import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { navigation } from "./navigation";
import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE, COLOR_SCHEMES } from "@/modules/demos/color-schemes";

/**
 * Agent-consumable markdown for every docs page: the source MDX with imports
 * and the metadata export stripped, each <ComponentPreview name="x" />
 * replaced by the demo's actual source, and each <PropsTable rows={x} />
 * rendered as a real markdown table from the same data file the live table
 * uses — so agents read exactly what users see, props included.
 *
 * Consumed by the .md route handlers, llms.txt / llms-full.txt, and (via
 * those endpoints) the astralis-mcp server's live mode.
 */

const APP_DOCS = join(process.cwd(), "src", "app", "docs");
const COMPONENTS_DIR = join(APP_DOCS, "components");
const DEMOS_DIR = join(process.cwd(), "src", "modules", "demos");
const SRC_DIR = join(process.cwd(), "src");

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  section: string;
  /** Guides live at /docs/<slug>; components at /docs/components/<slug>. */
  kind: "component" | "guide";
}

/** Every published page — guides and components — from the sidebar's navigation. */
export function listDocs(): DocEntry[] {
  const entries: DocEntry[] = [];
  for (const section of navigation) {
    for (const item of section.items) {
      if (item.status === "soon") continue;
      const component = item.href.match(/^\/docs\/components\/([a-z0-9-]+)$/);
      const guide = item.href.match(/^\/docs\/([a-z0-9-]+)$/);
      const kind: DocEntry["kind"] | null = component ? "component" : guide ? "guide" : null;
      if (!kind) continue; // e.g. the /docs introduction page
      const slug = (component ?? guide)![1];
      const mdxPath = mdxPathFor(slug, kind);
      if (!mdxPath) continue;
      const raw = readFileSync(mdxPath, "utf8");
      const description = raw.match(/description:\s*"([^"]+)"/)?.[1] ?? "";
      entries.push({ slug, title: item.title, description, section: section.title, kind });
    }
  }
  return entries;
}

/** One page as plain markdown (returns null for unknown slugs). */
export function docAsMarkdown(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const mdxPath = mdxPathFor(slug, "component") ?? mdxPathFor(slug, "guide");
  if (!mdxPath) return null;
  return mdxToMarkdown(mdxPath);
}

/**
 * The /docs introduction page. Its href fits neither URL scheme, so it lives
 * outside listDocs — but it's the page that answers "what is Astralis", so
 * the assistant's retrieval indexes it explicitly.
 */
export function introAsMarkdown(): string {
  return mdxToMarkdown(join(APP_DOCS, "page.mdx"));
}

function mdxToMarkdown(mdxPath: string): string {
  let md = readFileSync(mdxPath, "utf8");

  // Map imported identifiers to their module paths BEFORE stripping imports,
  // so <PropsTable rows={buttonProps}/> can find its data file.
  const importPaths = new Map<string, string>();
  for (const m of md.matchAll(/^import\s+\{([^}]+)\}\s+from\s+"([^"]+)";?\s*$/gm)) {
    for (const name of m[1].split(",")) importPaths.set(name.trim(), m[2]);
  }

  // Strip the metadata export and every top-level import line.
  md = md.replace(/^export const metadata = \{[\s\S]*?\};\s*/m, "");
  md = md.replace(/^import\s.*$\n?/gm, "");

  // Inline each preview's demo source as a fenced tsx block.
  md = md.replace(/<ComponentPreview\s+name="([a-z0-9-]+)"[^/]*\/>/g, (_, name: string) => {
    const demoPath = findDemoFile(name);
    if (!demoPath) return `*(interactive demo: ${name})*`;
    const source = readFileSync(demoPath, "utf8").trim();
    return "```tsx\n" + source + "\n```";
  });

  // Render each props table from its data module as a markdown table.
  md = md.replace(/<PropsTable\s+rows=\{([A-Za-z0-9_]+)\}\s*\/>/g, (tag, ident: string) => {
    const rows = loadPropRows(importPaths.get(ident), ident);
    return rows ? propsTableMarkdown(rows) : tag;
  });

  return md.trim() + "\n";
}

function mdxPathFor(slug: string, kind: DocEntry["kind"]): string | null {
  // Guides must not shadow the components/ directory itself.
  if (kind === "guide" && slug === "components") return null;
  const path =
    kind === "component"
      ? join(COMPONENTS_DIR, slug, "page.mdx")
      : join(APP_DOCS, slug, "page.mdx");
  return existsSync(path) ? path : null;
}

/**
 * Constants a `*-props.ts` module may reference in a `type` field. The eval
 * below has no module system, so anything shared has to be handed in by name.
 * Keep this in step with what those modules actually import.
 */
const PROP_ROW_SCOPE: Record<string, unknown> = { COLOR_SCHEME_TYPE, COLOR_SCHEMES };

/**
 * Load one exported array from a `*-props.ts` data module. These files are our
 * own build-time constants (plain object/string literals, no logic), so a
 * Function-constructor eval is safe and spares us a TS parser.
 *
 * Must be anchored to `ident`: several modules export two arrays (flex/grid/
 * modal/steps each have a root and a parts table), and the previous greedy
 * `/=\s*(\[[\s\S]*\])\s*;/` ran from the first `[` to the last `];` — it
 * swallowed the `export const` between them, threw, and silently leaked the
 * raw `<PropsTable …/>` tag into llms.txt and every MCP `get_component`
 * response. Silent because the failure path returns the tag unchanged.
 */
function loadPropRows(importPath: string | undefined, ident: string): PropRow[] | null {
  if (!importPath?.startsWith("@/")) return null;
  const file = join(SRC_DIR, importPath.slice(2) + ".ts");
  if (!existsSync(file)) return null;
  const source = readFileSync(file, "utf8");

  // Find `export const <ident> ... = [` and take exactly that array.
  const start = source.match(new RegExp(`export\\s+const\\s+${ident}\\b[^=]*=\\s*\\[`));
  if (start?.index === undefined) return null;
  const literal = sliceArrayLiteral(source, start.index + start[0].length - 1);
  if (!literal) return null;

  try {
    const names = Object.keys(PROP_ROW_SCOPE);
    const rows = new Function(...names, `return ${literal};`)(
      ...names.map((n) => PROP_ROW_SCOPE[n]),
    ) as PropRow[];
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

/**
 * The array literal starting at `open` (which must index a `[`), matched by
 * bracket depth. String- and comment-aware, because a `]` inside a description
 * or a `//` comment would otherwise end the slice early.
 */
function sliceArrayLiteral(source: string, open: number): string | null {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i);
      if (nl === -1) return null;
      i = nl;
    } else if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) return null;
      i = end + 1;
    } else if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) return source.slice(open, i + 1);
  }
  return null;
}

function propsTableMarkdown(rows: PropRow[]): string {
  const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| \`${cell(row.prop)}\` | ${cell(row.type)} | ${row.default ? `\`${cell(row.default)}\`` : "—"} | ${cell(row.description)} |`,
    ),
  ].join("\n");
}

function findDemoFile(name: string): string | null {
  // Demo files live at demos/<component>/<name>.tsx; derive the folder from
  // the name's prefix by scanning (names are globally unique in the registry).
  for (const dir of readdirSync(DEMOS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const candidate = join(DEMOS_DIR, dir.name, `${name}.tsx`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}
