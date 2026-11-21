import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import spec from "astralis-ui/system-spec.json";
import { docAsMarkdown } from "@/lib/docs-markdown";
import { isPlacementOnly, placementOnlyComponents } from "./placement-only";

const PAGES = fileURLToPath(new URL("../../app/docs/components", import.meta.url));
const slug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const page = (dir: string) => readFileSync(join(PAGES, dir, "page.mdx"), "utf8");

/**
 * The placement row on a props table is what tells a developer that a recipe
 * component takes placement props and no paint. It appears only where the page
 * names its component with `of`, so a new recipe page without it would quietly
 * lose the rule.
 */
describe("placement row on recipe component pages", () => {
  it("reads the recipe components from the contract", () => {
    expect(isPlacementOnly("Button")).toBe(true);
    expect(isPlacementOnly("Box")).toBe(false);
    expect(isPlacementOnly("Text")).toBe(false);
    expect(placementOnlyComponents().length).toBeGreaterThan(40);
  });

  const withPage = placementOnlyComponents().filter((name) => existsSync(join(PAGES, slug(name), "page.mdx")));

  it.each(withPage)("%s's page names its component in its first props table", (name) => {
    const first = page(slug(name)).match(/<PropsTable[^>]*>/)?.[0];
    expect(first).toContain(`of="${name}"`);
  });

  it("carries the row into the markdown agents read", () => {
    expect(docAsMarkdown("button")).toContain("| `placement props` |");
    expect(docAsMarkdown("box")).not.toContain("placement props");
  });

  it("every of= names a recipe component", () => {
    const names = Object.keys(spec.components);
    for (const dir of readdirSync(PAGES, { withFileTypes: true })) {
      if (!dir.isDirectory() || !existsSync(join(PAGES, dir.name, "page.mdx"))) continue;
      for (const [, of] of page(dir.name).matchAll(/<PropsTable[^>]*\bof="([^"]+)"/g)) {
        expect(names).toContain(of);
        expect(isPlacementOnly(of)).toBe(true);
      }
    }
  });
});
