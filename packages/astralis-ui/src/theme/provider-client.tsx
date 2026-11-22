"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AstralisProvider } from "./provider";
import { ThemeProviderContext } from "./theme-context";
import type { Theme, ThemeTokens } from "./theme-context";
import {
  THEME_STORAGE_KEY,
  applyStoredThemeStyle,
  isTheme,
  readStoredTheme,
  readStoredThemeCss,
  writeStoredSeed,
  writeStoredTheme,
} from "./theme-storage";

type ThemeRuntime = typeof import("./theme-runtime");

/*
 * The theme maths is loaded on first need and shared by every provider on the
 * page. Once it is here, setTokens and the stored-seed restore run in the same
 * render as before; only the first use waits for the chunk.
 */
let runtime: ThemeRuntime | undefined;
let loading: Promise<ThemeRuntime> | undefined;
const loadRuntime = (): Promise<ThemeRuntime> =>
  (loading ??= import("./theme-runtime").then(
    (loaded) => (runtime = loaded),
    (error: unknown) => {
      loading = undefined; // a failed chunk load may be retried by the next call
      throw error;
    },
  ));

/** The `tokens` prop's variables: all of light, and what dark changes. */
export type ThemeStyles = { light: CSSProperties; dark: CSSProperties };

type ClientProviderProps = Parameters<typeof AstralisProvider>[0] & {
  /** Computed from `tokens` by AstralisProvider, on the server when it renders there. */
  themeStyles?: ThemeStyles;
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function AstralisClientProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
  className = "",
  tokens,
  persistTokens = false,
  themeStyles,
}: ClientProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Server and first client render agree: the default theme, system = light,
  // and the `tokens` prop. Stored choices are read after hydration.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [chosenTokens, setChosenTokens] = useState<ThemeTokens | undefined>(undefined);
  // True once the stored seed has been read, so the :root style ThemeScript
  // set is not removed while the maths to read it is still loading.
  const [seedRead, setSeedRead] = useState(false);
  // Bumped when the runtime arrives, to re-render with it.
  const [, setRuntimeReady] = useState(runtime !== undefined);
  // A setTokens call since the stored seed began loading wins over that seed.
  const chosenSinceRestore = useRef(false);
  // Only the latest setTokens may write storage, even if an earlier one was
  // still waiting for the maths.
  const writeSeq = useRef(0);
  const activeTokens = chosenTokens ?? tokens;

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

  useEffect(() => {
    if (!persistTokens) return;
    let live = true;
    chosenSinceRestore.current = false;
    const restore = (loaded: ThemeRuntime) => {
      if (!live) return;
      if (!chosenSinceRestore.current) setChosenTokens(loaded.readStoredSeed(storageKey));
      setRuntimeReady(true);
      setSeedRead(true);
    };
    if (!readStoredThemeCss(storageKey)) {
      // Nothing stored: no maths needed.
      setChosenTokens(undefined);
      setSeedRead(true);
    } else if (runtime) restore(runtime);
    else void loadRuntime().then(restore);
    return () => {
      live = false;
    };
  }, [storageKey, persistTokens]);

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

  const setTokens = useCallback(
    (next: ThemeTokens | undefined) => {
      chosenSinceRestore.current = true;
      setChosenTokens(next);
      if (next && !runtime) void loadRuntime().then(() => setRuntimeReady(true));
      if (!persistTokens) return;
      const seq = ++writeSeq.current;
      if (!next) writeStoredSeed(storageKey, "");
      else if (runtime) writeStoredSeed(storageKey, runtime.storedThemeCss(next));
      else {
        void loadRuntime().then((loaded) => {
          if (seq === writeSeq.current) writeStoredSeed(storageKey, loaded.storedThemeCss(next));
        });
      }
    },
    [persistTokens, storageKey],
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

  const loaded = runtime;
  useEffect(() => {
    if (!seedRead || !persistTokens) return;
    if (chosenTokens && !loaded) return; // runs again when the maths arrive
    const css = chosenTokens && loaded ? loaded.storedThemeCss(chosenTokens) : "";
    applyStoredThemeStyle(containerRef.current?.ownerDocument ?? document, css);
  }, [seedRead, persistTokens, chosenTokens, loaded]);

  // Semantic tokens are baked at :root, so the seed's overrides re-declare
  // the roles that point at an overridden primitive, per mode. A seed from
  // setTokens or storage is computed here once the maths has loaded; until
  // then the `tokens` prop's variables stay on.
  const tokenStyles =
    chosenTokens && loaded
      ? loaded.generateThemeTokens(chosenTokens, resolvedTheme)
      : themeStyles && resolvedTheme === "dark"
        ? { ...themeStyles.light, ...themeStyles.dark }
        : themeStyles?.light;

  return (
    <ThemeProviderContext.Provider
      value={{ theme, setTheme, resolvedTheme, tokens: activeTokens, setTokens }}
    >
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
