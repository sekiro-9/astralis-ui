"use client";

import { generateBrandShades, useTheme } from "astralis-ui";
import type { ScenePalette } from "./scene-canvas";

/** The library's own default brand (yellow-500), used until a seed sets one. */
const DEFAULT_BRAND = "#eab308";

/** The site brand's deep, mid and light shades: whatever the visitor has picked. */
export function useBrandPalette(): ScenePalette {
  const { tokens } = useTheme();
  const brand = tokens?.brandColor ?? DEFAULT_BRAND;
  const shades = generateBrandShades(brand) as Record<string, string>;
  const shade = (step: number) => shades[`--astralis-color-brand-${step}`] ?? brand;
  return [shade(700), shade(400), shade(300)];
}
