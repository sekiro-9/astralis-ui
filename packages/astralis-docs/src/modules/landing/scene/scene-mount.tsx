"use client";

import { useState } from "react";
import { SceneCanvas, type ScenePalette } from "./scene-canvas";
import { randomSeed, variantFor } from "./scene-seed";

// Loaded with `ssr: false` by HeroScene: the seed is random, so this must
// never render on the server or hydration would see a different scene.
export function SceneMount({ palette }: { palette: ScenePalette }) {
  const [variant] = useState(() => variantFor(randomSeed()));
  return <SceneCanvas variant={variant} palette={palette} />;
}
