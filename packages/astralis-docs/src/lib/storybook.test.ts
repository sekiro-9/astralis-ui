import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { navigation } from "./navigation";
import { STORYBOOK_URL, storyId, storyTitle, storybookLinks } from "./storybook";

const componentsDir = join(process.cwd(), "..", "astralis-ui", "src", "components");
const links = storybookLinks(componentsDir);

describe("storybook links", () => {
  it("turns a title into Storybook's id", () => {
    expect(storyId("Components/Data Entry/NumberInput")).toBe("components-data-entry-numberinput");
    expect(storyId("Components/Buttons/Button")).toBe("components-buttons-button");
  });

  it("reads the title only from stories that have a docs page", () => {
    expect(storyTitle(`const meta = { title: "Components/Layout/Box", tags: ["autodocs"] };`)).toBe("Components/Layout/Box");
    expect(storyTitle(`const meta = { title: "Components/Layout/Box" };`)).toBeNull();
  });

  it("links most component pages, by the folder that names them", () => {
    expect(Object.keys(links).length).toBeGreaterThan(70);
    expect(links["number-input"]).toBe(`${STORYBOOK_URL}/?path=/docs/components-data-entry-numberinput--docs`);
    expect(links.button).toBe(`${STORYBOOK_URL}/?path=/docs/components-buttons-button--docs`);
    expect(links.icon).toContain("--docs");
  });

  it("only links slugs the docs site has a page for", () => {
    const pages = new Set(
      navigation.flatMap((section) => section.items.map((item) => item.href)).filter((href) => href.startsWith("/docs/components/")).map((href) => href.split("/").pop()),
    );
    const unknown = Object.keys(links).filter((slug) => !pages.has(slug));
    // A stories folder with no docs page of its own is harmless (its link is
    // never shown), but a long list means the folder rule stopped matching.
    expect(unknown.length).toBeLessThan(8);
  });

  it("agrees with a built Storybook, when one is on disk", () => {
    const index = join(process.cwd(), "..", "astralis-ui", "storybook-static", "index.json");
    if (!existsSync(index)) return;
    const ids = new Set(Object.keys(JSON.parse(readFileSync(index, "utf8")).entries));
    for (const [slug, url] of Object.entries(links)) expect(ids.has(url.split("/docs/")[1]), slug).toBe(true);
  });
});
