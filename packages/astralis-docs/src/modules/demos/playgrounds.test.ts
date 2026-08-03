import { describe, expect, it } from "vitest";
import { deriveControls } from "@/lib/playground/controls";
import { playgrounds, type PlaygroundEntry } from "./playgrounds";

/* `satisfies` keeps each entry's literal shape, so the union only exposes the
   keys a given entry happens to declare. Widening to PlaygroundEntry here lets
   the tests ask about optional fields like `fixture` uniformly. */
const entries = Object.entries(playgrounds) as [string, PlaygroundEntry][];

describe("playground registry", () => {
  it.each(entries)("%s derives at least one control", (_name, entry) => {
    // A registered component whose rows yield nothing would render a tab over
    // an empty rail. hasPlayground() hides that at runtime, but silently — this
    // fails loudly instead, so a registration mistake is caught here.
    expect(deriveControls(entry.rows).length).toBeGreaterThan(0);
  });

  it.each(entries)("%s names a real component and tag", (_name, entry) => {
    expect(entry.component).toBeTruthy();
    expect(entry.tag).toMatch(/^[A-Z][A-Za-z.]*$/);
  });

  it.each(entries)("%s derives controls only for single, real prop names", (_name, entry) => {
    // Grouped documentation rows like "p · px · py" must never become controls
    // — they'd generate JSX for a prop that doesn't exist.
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

    it.each(fixtures)("%s ships a node and a matching source", (_name, entry) => {
      expect(entry.fixture!.node).toBeTruthy();
      expect(entry.fixture!.source.trim()).not.toBe("");
    });

    it.each(fixtures)("%s declares every non-compound tag its source uses", (_name, entry) => {
      // `Alert.Title` arrives on `Alert`; a bare `<Button>` does not, and an
      // undeclared one produces code that looks right and doesn't compile.
      const used = [...entry.fixture!.source.matchAll(/<([A-Z][A-Za-z0-9.]*)/g)].map((m) => m[1]);
      const declared = new Set([entry.tag, ...(entry.fixture!.imports ?? [])]);
      for (const tag of used) {
        expect(declared).toContain(tag.split(".")[0]);
      }
    });
  });

  it("keys the registry by demo names that ComponentPreview can match", () => {
    for (const name of Object.keys(playgrounds)) {
      expect(name).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
