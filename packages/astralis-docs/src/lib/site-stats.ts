import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { blocks } from "astralis-blocks";
import { COLOR_SCHEMES } from "astralis-ui/color-schemes";
import { navigation } from "./navigation";
import { uiVersion } from "./ui-version";

/**
 * The numbers the landing page quotes, counted from the site itself at build
 * time. Server-only: it reads the file system. Typed-in figures went stale
 * within a release ("Fifty components" while the sidebar listed 83).
 */

const STATUS_ALIASES = new Set(["error", "warning", "success", "info"]);

const componentCount = navigation
  .flatMap((group) => group.items)
  .filter((item) => item.href.startsWith("/docs/components/")).length;

function countExamples(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name === "page.mdx") {
      const source = readFileSync(join(entry.parentPath, entry.name), "utf8");
      count += source.match(/<ComponentPreview\b/g)?.length ?? 0;
    }
  }
  return count;
}

export interface SiteStats {
  version: string;
  components: number;
  hues: number;
  statusAliases: number;
  examples: number;
  blocks: number;
}

export const siteStats: SiteStats = {
  version: uiVersion,
  components: componentCount,
  hues: COLOR_SCHEMES.filter((scheme) => !STATUS_ALIASES.has(scheme)).length,
  statusAliases: COLOR_SCHEMES.filter((scheme) => STATUS_ALIASES.has(scheme)).length,
  examples: countExamples(join(process.cwd(), "src", "app", "docs")),
  blocks: Object.keys(blocks).length,
};
