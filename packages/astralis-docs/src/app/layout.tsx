import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { AstralisProvider } from "astralis-ui";
import { SiteChrome } from "@/modules/site/site-chrome";
import "astralis-ui/styles.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

/**
 * The version badge reads the library's own package.json rather than a string
 * in the header, which had gone stale by two releases.
 *
 * Read off disk rather than resolved through the module graph: astralis-ui
 * does not export its package.json, and a `require.resolve` call is something
 * Turbopack tries to follow at build time and fails on. The workspace-relative
 * path is the same assumption scripts/gen-block-thumbnails.mjs already makes.
 */
const uiVersion: string = JSON.parse(
  readFileSync(join(process.cwd(), "..", "astralis-ui", "package.json"), "utf8"),
).version;

export const metadata: Metadata = {
  title: {
    default: "Astralis UI",
    template: "%s — Astralis UI",
  },
  description:
    "A modern React component library with runtime theming, semantic tokens, and zero-config styling.",
};

/**
 * Applies `.astralis-dark` before first paint so a stored/system dark
 * preference never flashes light. The AstralisProvider takes ownership of the
 * class after hydration using the same storage key.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("astralis-ui-theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("astralis-dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AstralisProvider defaultTheme="system">
          <SiteChrome version={uiVersion}>{children}</SiteChrome>
        </AstralisProvider>
      </body>
    </html>
  );
}
