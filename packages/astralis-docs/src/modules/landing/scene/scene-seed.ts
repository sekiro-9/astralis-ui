export interface SceneVariant {
  readonly seed: number;
  readonly offset: readonly [number, number];
  readonly warp: number;
  readonly speed: number;
  readonly scale: number;
  readonly angle: number;
}

export function randomSeed(): number {
  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return bytes[0] ?? 0;
}

/** Deterministic: the same seed always paints the same scene. */
export function variantFor(seed: number): SceneVariant {
  const next = mulberry32(seed >>> 0);
  const between = (lo: number, hi: number) => lo + next() * (hi - lo);

  return {
    seed: seed >>> 0,
    offset: [between(-40, 40), between(-40, 40)],
    warp: between(1.3, 2.4),
    speed: between(0.035, 0.07),
    scale: between(0.55, 0.95),
    angle: between(0, Math.PI * 2),
  };
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
