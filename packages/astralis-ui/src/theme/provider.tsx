import type { ReactNode } from "react";
import { generateThemeTokens } from "./css-vars";
import { AstralisClientProvider } from "./provider-client";
import type { ThemeStyles } from "./provider-client";
import type { Theme, ThemeTokens } from "./theme-context";
import { THEME_STORAGE_KEY } from "./theme-storage";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  className?: string;
  tokens?: ThemeTokens;
  /**
   * Remember a seed chosen with `setTokens` across visits, in localStorage.
   * Pair it with `<ThemeScript persistTokens />` so the stored theme applies
   * before first paint. Only one provider on a page should set it.
   */
  persistTokens?: boolean;
}

/**
 * The seed's variables for light, and only what dark changes, so the payload
 * sent to the client carries most variables once. Both modes list the same
 * names in the same order, so `{ ...light, ...dark }` is the full dark set;
 * a name dark lacks is sent as undefined, which drops it from the style.
 */
function modeStyles(tokens: ThemeTokens): ThemeStyles {
  const light = generateThemeTokens(tokens, "light") as Record<string, string>;
  const full = generateThemeTokens(tokens, "dark") as Record<string, string>;
  const dark: Record<string, string | undefined> = {};
  for (const name of new Set([...Object.keys(light), ...Object.keys(full)])) {
    if (light[name] !== full[name]) dark[name] = full[name];
  }
  return { light, dark };
}

/*
 * Server-safe on purpose: rendered from a Server Component layout, the seed's
 * CSS variables are computed here, on the server, for both modes, and only
 * plain style objects cross to the client. The theme maths then never
 * enters the browser bundle unless setTokens or a stored seed asks for it
 * (see ./provider-client and ./theme-runtime).
 */
export function AstralisProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
  className = "",
  tokens,
  persistTokens = false,
}: ThemeProviderProps) {
  const themeStyles = tokens ? modeStyles(tokens) : undefined;
  return (
    <AstralisClientProvider
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      className={className}
      tokens={tokens}
      persistTokens={persistTokens}
      themeStyles={themeStyles}
    >
      {children}
    </AstralisClientProvider>
  );
}
