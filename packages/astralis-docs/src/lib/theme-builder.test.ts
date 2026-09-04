import { describe, expect, it } from "vitest";
import { cssExport, decodeSeed, encodeSeed, restoreSeed } from "./theme-builder";

const encode = (value: unknown) => btoa(encodeURIComponent(JSON.stringify(value)));

describe("shared theme links", () => {
  it("round-trips a real seed", () => {
    const seed = {
      brandColor: "#8b5cf6",
      fontHeading: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
      radiusScale: 1.75,
    };
    expect(decodeSeed(encodeSeed(seed))).toEqual(seed);
  });

  it("drops a font stack that would break out of the seed comment", () => {
    const seed = decodeSeed(encode({ brandColor: "#3b82f6", fontBody: "x*/ body{display:none} /*" }));
    expect(seed).toEqual({ brandColor: "#3b82f6" });
    expect(cssExport({ seed, previewFonts: {} })).not.toContain("display:none");
  });

  it.each([
    ["a declaration break", "Inter; color: red"],
    ["a rule break", "Inter } body { color: red"],
    ["markup", "</style><script>alert(1)</script>"],
    ["a comment opener", "Inter /* hidden"],
  ])("drops a font stack carrying %s", (_, fontHeading) => {
    expect(decodeSeed(encode({ fontHeading }))).toEqual({});
  });

  it("drops colours and scales the library rejects", () => {
    expect(decodeSeed(encode({ brandColor: "red; x: y", radiusScale: -2, spacingScale: 1.1 }))).toEqual({
      spacingScale: 1.1,
    });
  });

  it("returns an empty seed for garbage", () => {
    expect(decodeSeed("%%%not-base64")).toEqual({});
  });
});

describe("restoreSeed", () => {
  it("sanitises what another tab wrote to storage", () => {
    expect(restoreSeed(JSON.stringify({ grayColor: "#64748b", fontMono: "mono;}" }))).toEqual({
      grayColor: "#64748b",
    });
  });
});
