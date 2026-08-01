import NextLink from "next/link";
import { Box, Card, Tag } from "astralis-ui";
import type { BlockSummary } from "@/lib/blocks";
import { BlockThumbnail } from "./block-thumbnail";

interface BlockCardProps {
  block: BlockSummary;
  eager?: boolean;
  /**
   * Filtered out of the current category. The card stays mounted — hiding it
   * keeps its preview document alive, where removing it would reload the
   * iframe from scratch the next time that category is selected.
   */
  hidden?: boolean;
}

/**
 * One tile in the gallery grid: live thumbnail, name, and its variation id.
 *
 * `next/link` wraps the card rather than the library's `Link` — that one is the
 * inline text-link recipe (accent colour, hover underline), which would paint
 * every child. This is a navigation surface, not a text link.
 */
export function BlockCard({ block, eager, hidden }: BlockCardProps) {
  return (
    <NextLink
      href={`/blocks/${block.id}`}
      hidden={hidden}
      // `hidden` also takes the card out of the tab order and the a11y tree,
      // so a filtered-out block is not reachable by keyboard.
      className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring"
    >
      {/* Card.Root has no padding of its own — it lives on Body — so the
          thumbnail sits flush to the clipped edges. */}
      <Card variant="outline" size="sm" hoverable className="h-full">
        <Box borderB="normal" borderColor="subtle">
          <BlockThumbnail id={block.id} name={block.name} eager={eager} />
        </Box>

        {/* Name and id only — the description lives on the detail page. A grid
            of thumbnails is scanned visually, and two lines of prose per tile
            competed with the previews rather than adding to them. */}
        <Card.Body className="flex flex-col items-start gap-2">
          <Card.Title className="astralis:text-sm">{block.name}</Card.Title>
          <Tag size="sm" variant="subtle" colorScheme="gray">
            {block.id}
          </Tag>
        </Card.Body>
      </Card>
    </NextLink>
  );
}
