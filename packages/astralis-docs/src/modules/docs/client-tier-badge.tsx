"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Badge, Tooltip } from "astralis-ui";

/**
 * The per-component client/server badge. Client-side only because a STATIC
 * layout cannot know which child segment is active during server render —
 * `useSelectedLayoutSegment` is the supported way to read it, and it is a
 * client hook. The payload is one tiny slug→tier map serialized by the
 * server layout; the spec itself never reaches the browser.
 */
const LABELS = {
  none: { text: "Server Component · 0 KB client JS", scheme: "green" },
  leaf: { text: "Server shell + client leaf", scheme: "teal" },
  required: { text: "Client component", scheme: "orange" },
} as const;

const EXPLAIN = {
  none: "Rendering this component ships none of its JavaScript to the browser — it renders to HTML on the server.",
  leaf: "The shell renders on the server; only a small interactive part inside hydrates.",
  required: "This component is interactive and hydrates in the browser.",
} as const;

export function ClientTierBadge({ tiers }: { tiers: Record<string, keyof typeof LABELS> }) {
  const segment = useSelectedLayoutSegment();
  const tier = segment ? tiers[segment] : undefined;
  if (!tier) return null;

  const { text, scheme } = LABELS[tier];
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Badge colorScheme={scheme} variant="subtle">
          {text}
        </Badge>
      </Tooltip.Trigger>
      <Tooltip.Content>{EXPLAIN[tier]}</Tooltip.Content>
    </Tooltip>
  );
}
