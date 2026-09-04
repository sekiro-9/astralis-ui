import { getThemeScript, type ThemeScriptOptions } from "./theme-storage";

export interface ThemeScriptProps extends ThemeScriptOptions {
  /** CSP nonce for the inline script. */
  nonce?: string;
}

/**
 * Applies the stored or system theme before first paint, so dark-mode users
 * never see a flash of the light theme. Render it inside `<head>` with the
 * same `storageKey` and `defaultTheme` as AstralisProvider.
 */
export function ThemeScript({ storageKey, defaultTheme, nonce }: ThemeScriptProps) {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: getThemeScript({ storageKey, defaultTheme }) }}
    />
  );
}
