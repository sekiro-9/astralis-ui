import type { Metadata } from "next";
import { Stack } from "astralis-ui";
import { ThemeBuilder } from "@/modules/theme-builder";
import { URL_PARAM, decodeSeed } from "@/lib/theme-builder";

export const metadata: Metadata = {
  title: "Theme Builder",
  description:
    "Design your Astralis theme visually: color, size, typography and motion tokens with a live component canvas, exported as one stylesheet.",
};

/**
 * The shared seed is decoded HERE, on the server, so the first paint already
 * shows the shared theme and the client has nothing to restore. Doing it in a
 * client effect instead would render the default first, then swap: a flash,
 * plus a hydration mismatch to work around.
 */
export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const shared = params[URL_PARAM];
  const initialSeed = typeof shared === "string" ? decodeSeed(shared) : {};

  return (
    // A fixed viewport height from lg up only: below it the page scrolls as a
    // whole, since the three panels stack and cannot share one screen.
    <Stack as="main" h={{ lg: "calc(100vh - 3.5rem)" }} minH="0" p={{ base: "4", lg: "5" }} overflow={{ lg: "hidden" }}>
      <ThemeBuilder initialSeed={initialSeed} />
    </Stack>
  );
}
