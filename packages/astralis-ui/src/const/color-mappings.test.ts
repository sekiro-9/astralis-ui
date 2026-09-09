import { describe, expect, it } from "vitest";
import { bgColors, borderColors, textColors } from "./color-mappings";
import { isChannelMap } from "./channel";
import { HUES, STEPS } from "../theme/token-spec";

const v = (name: string) => `var(--astralis-color-${name})`;

describe("colour value maps", () => {
  it("accept the bare hue and the role spelled out, for every palette including gray", () => {
    for (const hue of HUES) {
      expect(bgColors[hue]).toBe(v(`${hue}-solid`));
      expect(bgColors[`${hue}-solid`]).toBe(v(`${hue}-solid`));
      expect(bgColors[`${hue}-subtle`]).toBe(v(`${hue}-subtle`));
      expect(textColors[hue]).toBe(v(`${hue}-label`));
      expect(textColors[`${hue}-label`]).toBe(v(`${hue}-label`));
      expect(textColors[`${hue}-contrast`]).toBe(v(`${hue}-contrast`));
      expect(borderColors[hue]).toBe(v(`${hue}-stroke`));
      expect(borderColors[`${hue}-stroke`]).toBe(v(`${hue}-stroke`));
    }
  });

  it("carry every ramp step of every palette", () => {
    for (const map of [bgColors, textColors, borderColors]) {
      for (const hue of HUES) {
        for (const step of STEPS) expect(map[`${hue}-${step}`]).toBe(v(`${hue}-${step}`));
      }
    }
  });

  it("map the neutral ladders and the control stroke", () => {
    expect(bgColors.raised).toBe(v("surface-raised"));
    expect(textColors.subtle).toBe(v("label-subtle"));
    expect(borderColors.control).toBe(v("stroke-control"));
  });

  it("stay channel-routable", () => {
    expect([bgColors, textColors, borderColors].every(isChannelMap)).toBe(true);
  });
});
