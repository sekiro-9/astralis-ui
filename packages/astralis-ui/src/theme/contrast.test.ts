import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  contrastRatio,
  contrastContracts,
  verifyContrast,
  verifySeedContrast,
  parsePaletteFromCss,
} from "./contrast";
import { contrastOn } from "./theme-math";

const palette = parsePaletteFromCss(
  readFileSync(join(__dirname, "tokens", "color.css"), "utf8"),
);

describe("WCAG contrast math", () => {
  it("matches known ratios", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    // #767676 is the canonical 4.54:1-on-white gray.
    expect(contrastRatio("#767676", "#ffffff")!).toBeGreaterThan(4.5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 3);
  });

  it("contrastOn picks the WCAG-winning side, not the OKLCH guess", () => {
    // The day-one catches: white on these shipped at 3.3-3.7:1.
    expect(contrastOn(palette["green-600"])).toBe("#000000");
    expect(contrastOn(palette["teal-600"])).toBe("#000000");
    expect(contrastOn(palette["cyan-600"])).toBe("#000000");
    // And where white genuinely wins it stays white.
    expect(contrastOn(palette["red-600"])).toBe("#ffffff");
    expect(contrastOn("#000000")).toBe("#ffffff");
  });
});

describe("contrast contracts", () => {
  it("the shipped palette keeps every promise, both modes", () => {
    for (const mode of ["light", "dark"] as const) {
      const failures = verifyContrast((ref) => palette[ref], mode).filter((r) => !r.pass);
      expect(failures.map((f) => `${f.mode} ${f.rule} ${f.ratio?.toFixed(2)}`)).toEqual([]);
    }
  });

  it("contracts cover neutrals and all fifteen hues", () => {
    const rules = contrastContracts("light").map((c) => c.rule);
    expect(rules).toContain("label-base on surface-base");
    expect(rules).toContain("brand: contrast on solid");
    expect(rules.filter((r) => r.includes("contrast on solid"))).toHaveLength(15);
  });

  it("an unresolvable reference fails rather than passing silently", () => {
    const rs = verifyContrast(() => undefined, "light");
    expect(rs.every((r) => !r.pass)).toBe(true);
  });
});

describe("seeded themes", () => {
  it("a solid brand seed passes everything", () => {
    const failures = verifySeedContrast({ brandColor: "#2563eb" }, palette).filter((r) => !r.pass);
    expect(failures).toEqual([]);
  });

  it("a pale brand seed is caught with the exact pairing", () => {
    const failures = verifySeedContrast({ brandColor: "#b5f5d8" }, palette).filter((r) => !r.pass);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].rule).toBe("brand: label on subtle");
    expect(failures[0].ratio!).toBeLessThan(4.5);
  });

  it("the generated contrast-on-solid stays correct for any seed (auto rule)", () => {
    for (const brandColor of ["#b5f5d8", "#111827", "#eab308", "#7c3aed"]) {
      const solids = verifySeedContrast({ brandColor }, palette).filter(
        (r) => r.rule === "brand: contrast on solid" && !r.pass,
      );
      expect(solids.map((s) => `${s.mode} ${s.fgHex} on ${s.bgHex} ${s.ratio?.toFixed(2)}`)).toEqual([]);
    }
  });
});
