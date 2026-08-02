"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Assistant } from "@/modules/assistant/assistant";

/**
 * Site chrome, minus the routes that must render bare.
 *
 * `/preview/*` exists to be loaded inside an iframe (block thumbnails and the
 * viewport switcher), where a sticky header and a floating assistant would sit
 * on top of the very thing being previewed. Gating here keeps the single root
 * layout intact — the alternative is moving every existing route into a
 * `(site)` group just to get a second root layout.
 */
export function SiteChrome({
  children,
  version,
}: {
  children: React.ReactNode;
  version: string;
}) {
  const bare = usePathname().startsWith("/preview");

  if (bare) return <>{children}</>;

  return (
    <>
      <Header version={version} />
      {children}
      <Assistant />
    </>
  );
}
