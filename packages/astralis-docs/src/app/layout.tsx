import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { AstralisProvider, ThemeScript } from "astralis-ui";
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
      <head>
        {/* Before first paint: the stored dark mode and the brand the visitor picked. */}
        <ThemeScript persistTokens />
      </head>
      <body suppressHydrationWarning>
        <AstralisProvider defaultTheme="system" persistTokens>
          <SiteChrome version={uiVersion}>{children}</SiteChrome>
        </AstralisProvider>
      </body>
    </html>
  );
}
