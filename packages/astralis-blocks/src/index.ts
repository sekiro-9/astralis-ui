export { BLOCK_CATEGORIES } from "./registry";
export type {
  BlockCategory,
  BlockMeta,
  BlockRegistryEntry,
  BlockPayload,
} from "./registry";

export { blocks } from "./blocks.generated";
export type { BlockId, BlockEntry } from "./blocks.generated";

/** Verbatim block source — server-side only, keep out of client components. */
export { blockSources } from "./sources.generated";
export type { BlockSourceFile } from "./sources.generated";
