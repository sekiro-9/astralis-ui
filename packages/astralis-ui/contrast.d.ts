/**
 * Hand-authored declarations for the "astralis-ui/contrast" subpath.
 * The build rolls all other types into dist/index.d.ts; this small surface is
 * kept by hand so Node consumers (astralis-cli) get types without pulling in
 * the React entry. Update it if contrast.ts's exports change.
 */

import type { ThemeSeed } from "./serialize";

export type Mode = "light" | "dark";

export interface ContrastContract {
  fg: string;
  bg: string;
  min: number;
  rule: string;
}

export interface ContrastResult extends ContrastContract {
  mode: Mode;
  fgHex?: string;
  bgHex?: string;
  ratio?: number;
  pass: boolean;
}

export function relativeLuminance(hex: string): number | undefined;
export function contrastRatio(a: string, b: string): number | undefined;
export function contrastContracts(mode: Mode): ContrastContract[];
export function verifyContrast(
  resolve: (ref: string) => string | undefined,
  mode: Mode,
): ContrastResult[];
export function verifySeedContrast(
  seed: ThemeSeed,
  staticPalette: Record<string, string>,
  modes?: Mode[],
): ContrastResult[];
export function parsePaletteFromCss(cssText: string): Record<string, string>;
