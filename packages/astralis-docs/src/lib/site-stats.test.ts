import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { navigation } from "./navigation";
import { siteStats } from "./site-stats";

const COMPONENTS_DIR = join(process.cwd(), "src", "app", "docs", "components");

describe("siteStats", () => {
  it("counts exactly the component pages that exist", () => {
    const pages = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(COMPONENTS_DIR, entry.name, "page.mdx")))
      .map((entry) => `/docs/components/${entry.name}`)
      .sort();
    const listed = navigation
      .flatMap((group) => group.items)
      .map((item) => item.href)
      .filter((href) => href.startsWith("/docs/components/"))
      .sort();

    expect(listed).toEqual(pages);
    expect(siteStats.components).toBe(pages.length);
  });

  // The intro, quick start and theming pages spell these out in words.
  it("splits the color schemes into hues and status aliases", () => {
    expect(siteStats.hues).toBe(11);
    expect(siteStats.statusAliases).toBe(4);
  });

  it("finds the live examples", () => {
    expect(siteStats.examples).toBeGreaterThan(siteStats.components);
  });
});
