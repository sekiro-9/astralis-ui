"use client";

import { Tabs, Text } from "astralis-ui";
import { groupByFamily, type BlockCategoryGroup, type BlockSummary } from "@/lib/blocks";
import { useMediaQuery } from "@/lib/use-media-query";
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
 * The second tab row: families within whichever category is showing.
 *
 * One instance per category panel rather than a single shared row — the outer
 * Tabs unmounts inactive panels, so switching category tears this down and the
 * family selection resets to "All" instead of stranding the grid on a family
 * the new category does not contain.
 */
function FamilyTabs({ entries }: { entries: BlockSummary[] }) {
  const families = groupByFamily(entries);
  /*
   * `orientation` changes the DOM structure, not just styling, so a breakpoint
   * class cannot do this. Below `lg` a 176px rail would leave the grid ~127px
   * wide, so the tabs lie back down.
   */
  const vertical = useMediaQuery("(min-width: 1024px)");
  const panelClass = vertical ? "min-w-0 flex-1" : "pt-6";

  return (
    /* Vertical: the root lays list and panel out as a row, so the rail sits
       beside the grid with the active indicator running down its inner edge. */
    <Tabs
      defaultValue="all"
      variant="line"
      size="sm"
      orientation={vertical ? "vertical" : "horizontal"}
      className={vertical ? "astralis:gap-6 mt-2" : "astralis:gap-0 mt-2"}
    >
      {/* Fixed rail width — letting it size to its content would shift the grid
          sideways every time a category with longer family names is selected. */}
      <Tabs.List
        aria-label="Block families"
        className={vertical ? "w-44 shrink-0" : "self-start"}
      >
        <Tabs.Trigger value="all" className={vertical ? "astralis:justify-between" : ""}>
          All
          <Count value={entries.length} />
        </Tabs.Trigger>
        {families.map((group) => (
          <Tabs.Trigger
            key={group.family}
            value={group.family}
            className={vertical ? "astralis:justify-between" : ""}
          >
            {group.label}
            <Count value={group.entries.length} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Vertical: min-w-0 so the grid can shrink inside the flex row rather
          than overflowing — grid items refuse to go below their content width.
          Horizontal: the panel needs its own breathing room under the rail. */}
      <Tabs.Content value="all" className={panelClass}>
        <Grid entries={entries} />
      </Tabs.Content>
      {families.map((group) => (
        <Tabs.Content key={group.family} value={group.family} className={panelClass}>
          <Grid entries={group.entries} />
        </Tabs.Content>
      ))}
    </Tabs>
  );
}

/**
 * The block gallery: category tabs, then family tabs, over a grid of live
 * thumbnails.
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
        <FamilyTabs entries={all} />
      </Tabs.Content>
      
      {groups.map((group) => (
        <Tabs.Content key={group.category} value={group.category}>
          <FamilyTabs entries={group.entries} />
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
