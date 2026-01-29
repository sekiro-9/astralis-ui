"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export type ThemeTokens = Partial<{
  primaryColor: string;
}>;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  className?: string;
  tokens?: ThemeTokens;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function AstralisProvider({
  children,
  defaultTheme = "system",
  storageKey = "astralis-ui-theme",
  className = "",
  tokens,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      // Only use stored value if no explicit defaultTheme was passed
      // by checking if defaultTheme is still the fallback "system"
      // Instead: always honour defaultTheme when it's explicitly "light" or "dark"
      if (defaultTheme !== "system") {
        return defaultTheme;
      }
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  // Derive resolvedTheme synchronously so there's no flash
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(theme)
  );

  // Keep resolvedTheme in sync when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Only persist to localStorage when theme is user-driven (not forced by prop)
    if (defaultTheme === "system") {
      if (theme !== "system") {
        localStorage.setItem(storageKey, theme);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [theme, storageKey, defaultTheme]);

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolvedTheme(resolveTheme("system"));

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const tokenStyles = tokens
    ? ({
        "--astralis-primary-500": tokens.primaryColor,
      } as React.CSSProperties)
    : undefined;

  const value = {
    theme,
    setTheme: (newTheme: Theme) => setThemeState(newTheme),
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <div
        className={`astralis ${resolvedTheme === "dark" ? "astralis-dark" : ""} ${className}`.trim()}
        style={tokenStyles}
      >
        {children}
      </div>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a AstralisProvider");
  }
  return context;
};