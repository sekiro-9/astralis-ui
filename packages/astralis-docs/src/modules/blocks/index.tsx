"use client";

import { useState } from "react";
import { Grid, Tabs, Text } from "astralis-ui";
import { type BlockCategoryGroup, type BlockSummary } from "@/lib/blocks";
import { BlockCard } from "./components/block-card";

const ALL = "all";

interface BlockGalleryProps {
  groups: BlockCategoryGroup[];
  all: BlockSummary[];
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
 * Every card holds an iframe, so the expensive thing here is not rendering —
 * it is how many preview *documents* exist and how often they are thrown away.
 * Two decisions follow from that:
 *
 * 1. One grid holding every block, filtered by hiding cards. A panel per
 *    category would render its own copy of cards the "All" panel already had,
 *    and Tabs.Content unmounts inactive panels — so every filter click tore
 *    down all 36 frames and reloaded them from scratch.
 *
 * 2. A single Tabs.Content whose `value` tracks the active tab, so the panel is
 *    always the active one. React reconciles the same node and the grid inside
 *    it is never remounted; only the panel's id and label change. ARIA still
 *    reads correctly — the panel is labelled by whichever trigger is active.
 *
 * The net effect is that a preview loads at most once per page visit. Cards
 * filtered out stay in the DOM as `display: none`, which also means their lazy
 * iframes never load until that category is actually selected.
 */
export function BlockGallery({ groups, all }: BlockGalleryProps) {
  const [category, setCategory] = useState(ALL);

  return (
    <Tabs
      value={category}
      onValueChange={setCategory}
      variant="segmented"
      size="sm"
      className="astralis:gap-4"
    >
      <Tabs.List aria-label="Block categories" className="self-start">
        <Tabs.Trigger value={ALL}>
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

      <Tabs.Content value={category}>
        <Grid columns={{ base: "1", sm: "2", lg: "3" }} gap="5">
          {all.map((block, index) => (
            /* The first row is above the fold — load those iframes eagerly so
               the gallery does not open on a grid of blank tiles. */
            <BlockCard
              key={block.id}
              block={block}
              eager={index < 3}
              hidden={category !== ALL && block.category !== category}
            />
          ))}
        </Grid>
      </Tabs.Content>
    </Tabs>
  );
}
