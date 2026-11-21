// The attribute lets the search-index script (esbuild, then plain Node) load it too.
import spec from "astralis-ui/system-spec.json" with { type: "json" };

const components = (spec as { components: Record<string, { groups?: string[] }> }).components;

/**
 * A recipe component: it takes the placement group and no other style props.
 * Read from the contract so the props table cannot drift from what the types accept.
 */
export function isPlacementOnly(component: string): boolean {
  const groups = components[component]?.groups;
  return groups?.length === 1 && groups[0] === "placement";
}

/** Every recipe component in the contract, by name. */
export const placementOnlyComponents = (): string[] => Object.keys(components).filter(isPlacementOnly);

/** Where the rule is explained in full. */
export const PLACEMENT_RULE_HREF = "/docs/style-props#paint-and-placement";

/**
 * The placement rule, stated where a developer looks when `p` or `bg` does
 * nothing on a Button or Card. One row shared by every recipe page, on the
 * live table and in the markdown agents read.
 */
export const placementRow = {
  prop: "placement props",
  type: "w · h · m · flex · position · display",
  description:
    "Where it sits is up to its parent: width, height, margin, flex, position, display and motion. How it looks is its own, set by its own props (variant, size, colorScheme); for padding or a background, wrap it in a Box.",
};
