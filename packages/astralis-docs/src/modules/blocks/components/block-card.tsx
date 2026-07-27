import NextLink from "next/link";
import { Badge, Card } from "astralis-ui";
import type { BlockSummary } from "@/lib/blocks";
import { BlockThumbnail } from "./block-thumbnail";

interface BlockCardProps {
  block: BlockSummary;
  eager?: boolean;
}

/**
 * One tile in the gallery grid: live thumbnail, name, and its variation id.
 *
 * `next/link` wraps the card rather than the library's `Link` — that one is the
 * inline text-link recipe (accent colour, hover underline), which would paint
 * every child. This is a navigation surface, not a text link.
 */
export function BlockCard({ block, eager }: BlockCardProps) {
  return (
    <NextLink
      href={`/blocks/${block.id}`}
      className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring"
    >
      {/* Card.Root has no padding of its own — it lives on Body — so the
          thumbnail sits flush to the clipped edges. */}
      <Card variant="outline" size="sm" hoverable className="h-full">
        <div className="border-b border-stroke-subtle">
          <BlockThumbnail id={block.id} name={block.name} eager={eager} />
        </div>

        {/* Name and id only — the description lives on the detail page. A grid
            of thumbnails is scanned visually, and two lines of prose per tile
            competed with the previews rather than adding to them. */}
        <Card.Body className="flex flex-col items-start gap-2">
          <Card.Title className="astralis:text-sm">{block.name}</Card.Title>
          <Badge variant="outline" size="xs" className="font-mono lowercase">
            {block.id}
          </Badge>
        </Card.Body>
      </Card>
    </NextLink>
  );
}
