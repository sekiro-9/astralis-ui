"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Link } from "astralis-ui";

/**
 * A link from a component page to the same component in the published
 * Storybook, where every variant and state has a story. Client-side for the
 * same reason as the tier badge: only `useSelectedLayoutSegment` knows which
 * component page a static layout is showing. The server layout hands over the
 * slug-to-URL map; a component without stories gets no link.
 */
export function StorybookLink({ links }: { links: Record<string, string> }) {
  const segment = useSelectedLayoutSegment();
  const href = segment ? links[segment] : undefined;
  if (!href) return null;

  return (
    <Link href={href} external size="sm" color="muted">
      Storybook
    </Link>
  );
}
