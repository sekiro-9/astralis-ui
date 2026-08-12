import { describe, expect, it } from "vitest";
import { matchTier0 } from "./match";

/**
 * The CLI entry earns its place only if it actually catches the phrasings
 * people use. A bank answer that never matches is worse than no answer — it
 * reads as covered and silently falls through to the model.
 */
describe("tier 0 — CLI questions", () => {
  const questions = [
    "is there a cli?",
    "how do I scaffold a project",
    "create astralis app",
    "how do I add a block to my project",
    "does astralis have a command line tool",
    "start a new astralis project",
  ];

  for (const question of questions) {
    it(`answers "${question}" from the bank`, () => {
      expect(matchTier0(question)?.entry.id).toBe("cli");
    });
  }

  it("leaves the MCP question to the MCP entry", () => {
    expect(matchTier0("how do I set up the mcp server")?.entry.id).toBe("mcp");
  });

  it("does not swallow unrelated questions on the word alone", () => {
    // "cli" appears in neither, and neither is about tooling.
    expect(matchTier0("how do I use dark mode")?.entry.id).not.toBe("cli");
    expect(matchTier0("what colorScheme values exist")?.entry.id).not.toBe("cli");
  });
});
