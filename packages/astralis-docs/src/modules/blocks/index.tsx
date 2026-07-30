"use client";

import { Tabs, Text } from "astralis-ui";
import { type BlockCategoryGroup, type BlockSummary } from "@/lib/blocks";
import { BlockCard } from "./components/block-card";

interface BlockGalleryProps {
  groups: BlockCategoryGroup[];
  all: BlockSummary[];
}

/**
 * Every thumbnail renders into the same fixed canvas (see block-thumbnail), so
 * cards are identical height and their dividers, titles and id chips line up
 * regardless of which filter is active.
 */
function Grid({ entries }: { entries: BlockSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((block, index) => (
        /* The first row is above the fold — load those iframes eagerly so the
           gallery does not open on a grid of blank tiles. */
        <BlockCard key={block.id} block={block} eager={index < 3} />
      ))}
    </div>
  );
}

/** Count chip beside a tab label. */
function Count({ value }: { value: number }) {
  return (
    <Text as="span" size="xs" color="subtle">
      {value}
    </Text>
  );
}

/**
 * The block gallery: one row of category tabs over a grid of live thumbnails.
 *
 * Blocks are numbered per category, so there is no second grouping level — the
 * card name carries what the id deliberately does not.
 *
 * Panels are NOT kept mounted — each card holds an iframe, so mounting every
 * category at once would boot a browsing context for every block in the
 * registry on first paint.
 */
export function BlockGallery({ groups, all }: BlockGalleryProps) {
  return (
    <Tabs defaultValue="all" variant="segmented" size="sm" className="astralis:gap-4">
      <Tabs.List aria-label="Block categories" className="self-start">
        <Tabs.Trigger value="all">
          All
          <Count value={all.length} />
        </Tabs.Trigger>
        {groups.map((group) => (
          <Tabs.Trigger key={group.category} value={group.category}>
            {group.label}
            <Count value={group.entries.length} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="all">
        <Grid entries={all} />
      </Tabs.Content>
      
      {groups.map((group) => (
        <Tabs.Content key={group.category} value={group.category}>
          <Grid entries={group.entries} />
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
