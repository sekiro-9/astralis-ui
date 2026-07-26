/* ==========================================================================
   ASTRALIS — BLOCK REGISTRY TYPES
   --------------------------------------------------------------------------
   A block is a section-level composition of library primitives, delivered to
   consumers as SOURCE (the CLI copies the files into their project) rather
   than as a runtime export. Everything a block declares about itself lives in
   its `meta.ts`; everything derivable from its source (file list, which
   library components it uses) is computed by scripts/build-registry.mjs so
   the two can never drift.
   ========================================================================== */

/**
 * Categories are the SECTION a block is — the thing someone is shopping for
 * when they open the gallery ("I need a hero"). Not a business vertical:
 * "marketing" told a reader nothing and forced a second level of nesting to
 * get to anything useful.
 *
 * Extend this list as new section types land; it exists to catch typos, and a
 * category with no blocks in it never renders.
 */
export const BLOCK_CATEGORIES = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "stats",
  "logos",
  "team",
  "contact",
  "navbar",
  "footer",
  "auth",
  "dashboard",
  "content",
] as const;

export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

/**
 * Hand-authored block metadata (`meta.ts`).
 *
 * Two levels, no more: a `category` (the section) holds `family` groupings
 * (the structural skeleton), and each family numbers its variations.
 *
 *     hero  ->  hero-split  ->  hero-split-01, hero-split-02, …
 *     auth  ->  login       ->  login-01, login-02, …
 *
 * - `id`     what a consumer types (`astralis add hero-split-01`) and the key
 *            the docs and Studio look blocks up by. Always `{family}-{nn}`.
 * - `family` the structural skeleton. A genuinely different layout earns a new
 *            family; a different visual treatment of the SAME skeleton earns
 *            the next number instead.
 * - `name`   the human label on the docs card. This is where a variation gets
 *            to be descriptive — the id stays boring on purpose.
 */
export interface BlockMeta {
  id: string;
  category: BlockCategory;
  family: string;
  name: string;
  description: string;
  /** Free-form facets for docs filtering, e.g. "media-right", "dual-cta". */
  tags: string[];
}

/** Metadata as it lands in registry.json — hand-authored fields plus derived ones. */
export interface BlockRegistryEntry extends BlockMeta {
  /** Block-relative paths, entry file first. Derived from disk. */
  files: string[];
  /** Exported component name of the entry file. Derived from source. */
  component: string;
  /** `astralis-ui` components the block composes. Derived from its imports. */
  uses: string[];
}

/** One block's payload as served to the CLI: metadata plus the source to write. */
export interface BlockPayload extends BlockRegistryEntry {
  contents: { path: string; content: string }[];
}
