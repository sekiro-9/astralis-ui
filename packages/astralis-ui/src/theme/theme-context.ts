"use client";

import { createContext, useContext } from "react";
import type { ThemeSeed } from "./token-spec";

export type Theme = "light" | "dark" | "system";

/**
 * The theme seed. Was `{ brandColor }` only; now the full set of inputs a
 * theme is authored from (see ThemeSeed in ./token-spec). brandColor keeps its
 * exact previous meaning, so existing usage is unaffected.
 */
export type ThemeTokens = ThemeSeed;

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  /** The seed in effect: one set with setTokens, else the provider's `tokens` prop. */
  tokens?: ThemeTokens;
  /**
   * Re-themes everything under the provider at run time, for example from a
   * brand picker. `undefined` returns to the `tokens` prop. With
   * `persistTokens` the choice is stored and restored on the next visit.
   */
  setTokens: (tokens: ThemeTokens | undefined) => void;
}

/*
 * The context and its hook live here rather than beside AstralisProvider so
 * that provider.tsx exports a component and nothing else — react-refresh can
 * only fast-refresh a module whose exports are all components.
 */
export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used inside an AstralisProvider container root.");
  }
  return context;
};
