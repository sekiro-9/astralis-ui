import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { AstralisProvider } from "astralis-ui";
import { SiteChrome } from "@/modules/site/site-chrome";
import { uiVersion } from "@/lib/ui-version";
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

export const metadata: Metadata = {
  title: {
    default: "Astralis UI",
    template: "%s · Astralis UI",
  },
  description:
    "Accessible, themeable React components for crafting polished web apps and design systems. Server-first, built for the Next.js App Router.",
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
