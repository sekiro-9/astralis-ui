import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Fragment } from "react";
import { describe, expect, it } from "vitest";
import { deriveControls } from "@/lib/playground/controls";
import { hasPlayground, playgrounds, withoutPlayground, type PlaygroundEntry } from ".";

/* `satisfies` keeps each entry's literal shape, so the union only exposes the
   keys a given entry happens to declare. Widening to PlaygroundEntry here lets
   the tests ask about optional fields like `fixture` uniformly. */
const entries = Object.entries(playgrounds) as [string, PlaygroundEntry][];

describe("playground registry", () => {
  it.each(entries)("%s derives at least one control", (_name, entry) => {
    // A registered component whose rows yield nothing would render a tab over
    // an empty rail. hasPlayground() hides that at runtime, but silently; this
    // fails loudly instead, so a registration mistake is caught here.
    expect(deriveControls(entry.rows).length + (entry.styleProps?.length ?? 0)).toBeGreaterThan(0);
  });

  it.each(entries)("%s names a real component and tag", (_name, entry) => {
    expect(entry.component).toBeTruthy();
    expect(entry.tag).toMatch(/^[A-Z][A-Za-z.]*$/);
  });

  it.each(entries)("%s derives controls only for single, real prop names", (_name, entry) => {
    // Grouped documentation rows like "p · px · py" must never become controls:
    // they'd generate JSX for a prop that doesn't exist.
    for (const control of deriveControls(entry.rows)) {
      expect(control.prop).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    }
  });

  const fixtures = entries.filter(([, e]) => e.fixture);

  describe("fixtures", () => {
    it.each(fixtures)("%s does not also declare text children", (_name, entry) => {
      // They're mutually exclusive: the stage would render the fixture and the
      // panel would still offer a text input that changes nothing.
      expect(entry.children).toBeUndefined();
    });

    it.each(fixtures)("%s serializes its node to source", (_name, entry) => {
      // Throws when the node holds something a pasted snippet can't carry: a
      // function prop, or a component astralis-ui doesn't export.
      expect(entry.fixture!.source.trim()).not.toBe("");
    });

    it.each(fixtures)("%s hands the root its parts directly, not inside a fragment", (_name, entry) => {
      // Roots that pass props to their parts by cloning direct children see a
      // fragment as one opaque child, so the parts would miss the root's props.
      const node = entry.fixture!.node as { type?: unknown };
      expect(node?.type).not.toBe(Fragment);
    });

    it("names shared parts for the compound they sit in", () => {
      // Drawer and AlertDialog reuse Modal's parts, so one component reference
      // has three names. Only the fixture's root makes the right one clear.
      const modal: PlaygroundEntry = playgrounds["modal-demo"];
      const drawer: PlaygroundEntry = playgrounds["drawer-demo"];
      expect(modal.fixture!.source).toContain("<Modal.Title>");
      expect(drawer.fixture!.source).toContain("<Drawer.Title>");
      expect(modal.fixture!.imports).toContain("Button");
    });
  });

  describe("coverage", () => {
    const pagesDir = fileURLToPath(new URL("../../../app/docs/components", import.meta.url));
    const pages = readdirSync(pagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name))
      .map((entry) => {
        const mdx = readFileSync(join(pagesDir, entry.name, "page.mdx"), "utf8");
        return [entry.name, mdx.match(/<ComponentPreview\s+name="([a-z0-9-]+)"/)?.[1]] as const;
      });

    it.each(pages)("%s has a playground on its first demo, or a reason not to", (slug, demo) => {
      // The tab attaches to the page's FIRST preview, so that's the one that
      // has to be registered; a playground keyed to a later demo never shows.
      if (Object.hasOwn(withoutPlayground, slug)) {
        expect(demo && hasPlayground(demo)).toBeFalsy();
        return;
      }
      expect(demo, `${slug} has no ComponentPreview`).toBeDefined();
      expect(hasPlayground(demo!), `${slug}: register "${demo}" or add ${slug} to withoutPlayground`).toBe(true);
    });

    it("excludes only pages that exist", () => {
      const slugs = pages.map(([slug]) => slug);
      for (const slug of Object.keys(withoutPlayground)) expect(slugs).toContain(slug);
    });
  });

  it("keys the registry by demo names that ComponentPreview can match", () => {
    for (const name of Object.keys(playgrounds)) {
      expect(name).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
