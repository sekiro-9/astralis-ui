"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { generateThemeTokens } from "./css-vars";
import { ThemeProviderContext } from "./theme-context";
import type { Theme, ThemeTokens } from "./theme-context";
import { THEME_STORAGE_KEY, isTheme, readStoredTheme, writeStoredTheme } from "./theme-storage";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  className?: string;
  tokens?: ThemeTokens;
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function AstralisProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
  className = "",
  tokens,
}: ThemeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Server and first client render agree: the default theme, system = light.
  // The stored preference and the media query are read after hydration.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    setThemeState(readStoredTheme(storageKey) ?? defaultTheme);
    const media = window.matchMedia(DARK_QUERY);
    setSystemDark(media.matches);
    setHydrated(true);
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [defaultTheme, storageKey]);

  // Only an explicit choice is persisted, so a changed defaultTheme still
  // reaches visitors who never picked one.
  const setTheme = useCallback(
    (next: Theme) => {
      if (!isTheme(next)) return;
      setThemeState(next);
      writeStoredTheme(storageKey, next);
    },
    [storageKey],
  );

  // The provider owns the root dark class. Waiting for the stored preference
  // keeps it from stripping the class a pre-paint ThemeScript already set.
  // The document is the one the provider renders into, so a provider
  // portalled into an iframe themes that frame, not the page around it.
  useEffect(() => {
    if (!hydrated) return;
    const root = (containerRef.current?.ownerDocument ?? document).documentElement;
    root.classList.toggle("astralis-dark", resolvedTheme === "dark");
  }, [hydrated, resolvedTheme]);

  // Semantic tokens are baked at :root, so the seed's overrides re-declare
  // the roles that point at an overridden primitive, per mode.
  const tokenStyles = generateThemeTokens(tokens, resolvedTheme);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme, tokens }}>
      <div
        ref={containerRef}
        className={`astralis ${className}`.trim()}
        style={{
          minHeight: "100vh",
          width: "100%",
          ...tokenStyles,
        }}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeProviderContext.Provider>
  );
}
