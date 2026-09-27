export type Rgb = readonly [number, number, number];

export function hexToRgb(hex: string): Rgb | null {
  return parseColor(hex);
}

function parseColor(value: string): Rgb | null {
  const hex = /^#([0-9a-f]{6})/i.exec(value);
  if (hex?.[1]) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(value);
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];

  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  if (srgb) return [Number(srgb[1]), Number(srgb[2]), Number(srgb[3])];

  return null;
}
