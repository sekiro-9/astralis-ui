import { blocks, type BlockId } from "astralis-blocks";

/** A block's registry entry — plain data, safe to hand to a Client Component. */
export type BlockSummary = (typeof blocks)[BlockId]["meta"];

export interface BlockCategoryGroup {
  category: string;
  label: string;
  entries: BlockSummary[];
}

/**
 * Overrides for category slugs that title-casing gets wrong. Anything not
 * listed falls through to `titleCase`, so a new section type needs no entry.
 */
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  faq: "FAQ",
  cta: "Call to action",
  navbar: "Navigation",
  logos: "Logo clouds",
  signup: "Sign up",
  "forgot-password": "Forgot password",
};

/** `hero-split` -> `Hero Split`, `pricing` -> `Pricing`. */
function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL_OVERRIDES[category] ?? titleCase(category);
}

/** Every block in the registry, in stable id order. */
export function listBlocks(): BlockSummary[] {
  return Object.values(blocks)
    .map(({ meta }) => meta as BlockSummary)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Blocks bucketed by category for the gallery tabs. Derived from the registry,
 * so a new block folder shows up — tab and count included — on the next build.
 */
export function groupByCategory(all: BlockSummary[]): BlockCategoryGroup[] {
  const byCategory = new Map<string, BlockSummary[]>();
  for (const meta of all) {
    byCategory.set(meta.category, [...(byCategory.get(meta.category) ?? []), meta]);
  }

  return [...byCategory.entries()]
    .map(([category, entries]) => ({
      category,
      label: categoryLabel(category),
      entries,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

