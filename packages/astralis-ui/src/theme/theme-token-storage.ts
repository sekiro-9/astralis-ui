import { isEmptySeed, parseThemeSeed, themeCss } from "./serialize";
import { STORED_THEME_STYLE_ID, tokensStorageKey } from "./theme-storage";
import type { ThemeSeed } from "./token-spec";

const BANNER = "/* astralis-ui: the visitor's stored theme (AstralisProvider persistTokens) */";

/** The stored seed, or undefined when absent, empty, unreadable, or storage is blocked. */
export function readStoredSeed(storageKey: string): ThemeSeed | undefined {
  try {
    const css = window.localStorage.getItem(tokensStorageKey(storageKey));
    if (!css) return undefined;
    const seed = parseThemeSeed(css);
    return isEmptySeed(seed) ? undefined : seed;
  } catch {
    return undefined;
  }
}

/** The CSS a seed is stored and applied as; "" for no seed. */
export const storedThemeCss = (seed: ThemeSeed | undefined): string =>
  seed ? themeCss(seed, { banner: BANNER }) : "";

export function writeStoredSeed(storageKey: string, css: string): void {
  try {
    const key = tokensStorageKey(storageKey);
    if (css) window.localStorage.setItem(key, css);
    else window.localStorage.removeItem(key);
  } catch {
    // Storage blocked or full: the choice still applies for this session.
  }
}

/**
 * Keeps the seed on :root, where overlays portalled out of the provider's
 * container still inherit it. ThemeScript creates the same element before
 * first paint; this takes it over.
 */
export function applyStoredThemeStyle(doc: Document, css: string): void {
  let style = doc.getElementById(STORED_THEME_STYLE_ID);
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = doc.createElement("style");
    style.id = STORED_THEME_STYLE_ID;
    doc.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}
