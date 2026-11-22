/*
 * The half of persistTokens that needs the theme maths (parsing a stored seed,
 * serialising a chosen one). The client provider loads it with import() only
 * when a stored or chosen seed exists; the maths-free half is in ./theme-storage.
 */

import { isEmptySeed, parseThemeSeed, themeCss } from "./serialize";
import { readStoredThemeCss } from "./theme-storage";
import type { ThemeSeed } from "./token-spec";

const BANNER = "/* astralis-ui: the visitor's stored theme (AstralisProvider persistTokens) */";

/** The stored seed, or undefined when absent, empty, unreadable, or storage is blocked. */
export function readStoredSeed(storageKey: string): ThemeSeed | undefined {
  const css = readStoredThemeCss(storageKey);
  if (!css) return undefined;
  try {
    const seed = parseThemeSeed(css);
    return isEmptySeed(seed) ? undefined : seed;
  } catch {
    return undefined;
  }
}

/** The CSS a seed is stored and applied as; "" for no seed. */
export const storedThemeCss = (seed: ThemeSeed | undefined): string =>
  seed ? themeCss(seed, { banner: BANNER }) : "";
