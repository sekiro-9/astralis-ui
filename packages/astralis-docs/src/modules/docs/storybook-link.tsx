"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "astralis-ui";

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
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      size="xs"
      variant="outline"
      colorScheme="gray"
      // Sized to the xs label; Icon's smallest step (16px) reads as larger than the text.
      rightIcon={<ExternalLink size={12} aria-hidden="true" />}
    >
      Storybook
    </Button>
  );
}
