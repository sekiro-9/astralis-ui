import { describe, expect, it } from "vitest";
import { encodeQr, qrPath } from "./qr-encoder";

const rows = (m: ReturnType<typeof encodeQr>) =>
  m.modules.map((row) => row.map((dark) => (dark ? "#" : ".")).join(""));

// Golden matrices produced by the reference `qrcode` package (same version and mask).
describe("encodeQr", () => {
  it("encodes a URL in byte mode, bit-identical to the reference encoder", () => {
    const m = encodeQr("https://astralis.dev", "M");
    expect([m.version, m.mask]).toEqual([2, 2]);
    expect(rows(m)).toEqual([
      "#######..#..#...#.#######",
      "#.....#...#.#.##..#.....#",
      "#.###.#.###.....#.#.###.#",
      "#.###.#.#.#.###...#.###.#",
      "#.###.#.##.##.....#.###.#",
      "#.....#.#.#...###.#.....#",
      "#######.#.#.#.#.#.#######",
      "........####..#..........",
      "#.#####....#.####.#####..",
      ".....#...#....#.##.#...#.",
      ".#...#######.####.##.#.##",
      "#.##.#.#..#....#.#......#",
      "..##..#..#.#.....##.#.###",
      "#..##..#....##..##.#.#.#.",
      "#..#..#......###.#####.##",
      "#...#..##.#.##.##.###...#",
      "#...####..#.#.#.#####.#..",
      "........#.#....##...##...",
      "#######...###...#.#.#.###",
      "#.....#.#..#..#.#...##..#",
      "#.###.#.#.##...######.###",
      "#.###.#.##..###..##.#####",
      "#.###.#.#....###.#...##.#",
      "#.....#...#.##.##.####..#",
      "#######.###.#.#....######",
    ]);
  });

  it("encodes digits in numeric mode", () => {
    const m = encodeQr("01234567", "H");
    expect([m.version, m.mask]).toEqual([1, 6]);
    expect(rows(m)).toEqual([
      "#######..#....#######",
      "#.....#...###.#.....#",
      "#.###.#.#.....#.###.#",
      "#.###.#.###...#.###.#",
      "#.###.#..##...#.###.#",
      "#.....#...###.#.....#",
      "#######.#.#.#.#######",
      ".........###.........",
      "...##.##..##.....##..",
      ".##.#..###..#.#.###.#",
      "......#####.#.#.#.##.",
      ".#.##...#.#.###...#..",
      "..#...##.#.#.#...#.##",
      "........#....#.#.####",
      "#######.###.#..##..#.",
      "#.....#.....##.##.#..",
      "#.###.#.###..###..#.#",
      "#.###.#.##.##...##...",
      "#.###.#....#.##..####",
      "#.....#..#..###.#.#.#",
      "#######..###.##...##.",
    ]);
  });

  it("encodes non-Latin text as UTF-8 bytes", () => {
    // Version 1-L holds 17 bytes; six ✓ are six characters but 18 bytes.
    expect(encodeQr("✓".repeat(5), "L").version).toBe(1);
    expect(encodeQr("✓".repeat(6), "L").version).toBe(2);
  });

  it("grows the version with the error-correction level", () => {
    const text = "https://astralis-ui.com/docs/components/qr-code";
    const versions = (["L", "M", "Q", "H"] as const).map((l) => encodeQr(text, l).version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(versions[3]).toBeGreaterThan(versions[0]);
  });

  it("fills version 40 and rejects anything larger", () => {
    expect(encodeQr("a".repeat(2953), "L").version).toBe(40);
    expect(() => encodeQr("a".repeat(2954), "L")).toThrow(RangeError);
  });

  it("merges horizontal runs into one path rectangle each", () => {
    const m = encodeQr("x", "L");
    // Top row starts with the 7-module finder, then offsets by the margin.
    expect(qrPath(m, 1).startsWith("M1 1h7v1h-7z")).toBe(true);
  });
});
