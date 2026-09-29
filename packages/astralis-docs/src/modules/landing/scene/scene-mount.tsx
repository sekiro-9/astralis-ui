"use client";

import { useState } from "react";
import { SceneCanvas, type SceneFade } from "./scene-canvas";
import { useBrandPalette } from "./use-brand-palette";
import { randomSeed, variantFor } from "./scene-seed";

// Loaded with `ssr: false` by BrandScene: the seed is random, so this must
// never render on the server or hydration would see a different scene.
export function SceneMount({ fade }: { fade: SceneFade }) {
  const [variant] = useState(() => variantFor(randomSeed()));
  const palette = useBrandPalette();
  return <SceneCanvas variant={variant} palette={palette} fade={fade} />;
}
