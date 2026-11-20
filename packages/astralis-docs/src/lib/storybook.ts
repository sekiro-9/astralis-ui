import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Where the library's Storybook is published (GitHub Pages, from the storybook workflow). */
export const STORYBOOK_URL = "https://sekiro-9.github.io/astralis-ui";

/**
 * Storybook's own rule for turning a story title into the id in its URLs:
 * lower case, every run of punctuation or spaces becomes one hyphen.
 */
export function storyId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The title a stories file declares, when it also asks for a docs page. */
export function storyTitle(source: string): string | null {
  if (!/tags:\s*\[[^\]]*["']autodocs["']/.test(source)) return null;
  return source.match(/\btitle:\s*["']([^"']+)["']/)?.[1] ?? null;
}

/**
 * Docs slug to the Storybook page of the same component, read from the
 * library's stories on disk: `components/<category>/<slug>/<slug>.stories.tsx`.
 * A component folder's name is its docs slug, so no table is kept by hand, and
 * a component without stories simply gets no link.
 */
export function storybookLinks(componentsDir: string): Record<string, string> {
  const links: Record<string, string> = {};
  for (const category of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = join(componentsDir, category.name);
    for (const entry of readdirSync(categoryDir, { withFileTypes: true })) {
      // `icon` is a category folder that is itself the component.
      const dir = entry.isDirectory() ? join(categoryDir, entry.name) : categoryDir;
      const slug = entry.isDirectory() ? entry.name : category.name;
      const files = entry.isDirectory() ? readdirSync(dir) : [entry.name];
      const stories = files.find((file) => file.endsWith(".stories.tsx"));
      if (!stories || links[slug]) continue;
      const title = storyTitle(readFileSync(join(dir, stories), "utf8"));
      if (title) links[slug] = `${STORYBOOK_URL}/?path=/docs/${storyId(title)}--docs`;
    }
  }
  return links;
}
