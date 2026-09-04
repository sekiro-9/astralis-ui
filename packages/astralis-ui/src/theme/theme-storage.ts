import type { Theme } from "./theme-context";

/** The localStorage key AstralisProvider and ThemeScript share by default. */
export const THEME_STORAGE_KEY = "astralis-ui-theme";

export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

/** The stored preference, or null when absent, invalid, or storage is blocked. */
export function readStoredTheme(key: string): Theme | null {
  try {
    const value = window.localStorage.getItem(key);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(key: string, theme: Theme): void {
  try {
    window.localStorage.setItem(key, theme);
  } catch {
    // Storage blocked or full: the choice still applies for this session.
  }
}

export interface ThemeScriptOptions {
  /** Must match the provider's `storageKey`. Default "astralis-ui-theme". */
  storageKey?: string;
  /** Must match the provider's `defaultTheme`. Default "system". */
  defaultTheme?: Theme;
}

/** JSON is valid JS, but `</script>` inside a string would still end the element. */
const inlineJson = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");

/**
 * Source for an inline `<script>` that puts `astralis-dark` on `<html>` before
 * first paint, from the stored preference or `prefers-color-scheme`, using the
 * same rules as AstralisProvider. Render it in `<head>`, ahead of any content.
 */
export function getThemeScript({
  storageKey = THEME_STORAGE_KEY,
  defaultTheme = "system",
}: ThemeScriptOptions = {}): string {
  const fallback = isTheme(defaultTheme) ? defaultTheme : "system";
  return (
    "(function(k,d){try{var t=null;try{t=localStorage.getItem(k)}catch(e){}" +
    'if(t!=="light"&&t!=="dark"&&t!=="system")t=d;' +
    'var dark=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);' +
    'document.documentElement.classList.toggle("astralis-dark",dark)}catch(e){}})' +
    `(${inlineJson(storageKey)},${inlineJson(fallback)})`
  );
}
