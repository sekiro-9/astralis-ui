"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Link, Tag } from "astralis-ui";

/**
 * A link from a component page to the same component in the published
 * Storybook, where every variant and state has a story. Client-side for the
 * same reason as the tier marker: only `useSelectedLayoutSegment` knows which
 * component page a static layout is showing. The server layout hands over the
 * slug-to-URL map; a component without stories gets no link.
 *
 * Drawn as a Tag so it is the same height and corner as the tier marker it
 * sits beside, and as the version in the header.
 */
export function StorybookLink({ links }: { links: Record<string, string> }) {
  const segment = useSelectedLayoutSegment();
  const href = segment ? links[segment] : undefined;
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="plain"
      lineHeight="none"
      aria-label="Storybook (opens in a new tab)"
    >
      <Tag variant="outline" colorScheme="gray" endElement={<ExternalLink size={12} aria-hidden="true" />}>
        Storybook
      </Tag>
    </Link>
  );
}
