import type { VariantProps } from "class-variance-authority";
import { boxVariantMap, boxVariants } from "../components/layout/box/box.styles";
import { resolveStyleProps, type Responsive } from "./responsive";

/**
 * PLACEMENT PROPS
 * ---------------
 * The rule this file exists to enforce:
 *
 *   A component owns how it LOOKS. Its parent owns WHERE IT SITS and HOW BIG.
 *
 * Paint props — bg, color, borderColor, rounded, shadow, and the padding
 * inside a component — belong to its own recipe. A component with variants
 * owns its appearance, and letting a caller repaint it defeats the variant
 * system. Those stay off recipe components on purpose.
 *
 * Placement props describe a relationship the component cannot know: how wide
 * it should be in this row, whether it grows, what separates it from its
 * siblings. Only the composition knows, so anything that can be a child needs
 * to accept them. Without that, sizing a Card costs a wrapper node purely to
 * reach one prop — the same argument that moved flex-item props onto Box.
 *
 * `size` is excluded deliberately: on Box it means width AND height, while on
 * every recipe component it means a scale. Sharing the name is how
 * `<Container size="lg">` came to typecheck and silently set a height.
 *
 * Padding is excluded but margin is not: padding is space inside the
 * component, which its recipe owns; margin is space between it and its
 * siblings, which only the parent can decide.
 */
export const PLACEMENT_PROP_NAMES = [
  // Size — how much room it takes in the parent
  "w",
  "minW",
  "maxW",
  "h",
  "minH",
  "maxH",
  // Flex item — how it behaves in a flex parent
  "flex",
  "basis",
  "grow",
  "shrink",
  "order",
  "alignSelf",
  // Margin — space between it and its siblings
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
] as const;

export type PlacementPropName = (typeof PLACEMENT_PROP_NAMES)[number];

const PLACEMENT_SET = new Set<string>(PLACEMENT_PROP_NAMES);

/** Placement props, each accepting a scalar token or a responsive map. */
export type PlacementProps = Responsive<
  Pick<VariantProps<typeof boxVariants>, PlacementPropName>
>;

/**
 * Split a component's props into placement classes and everything else.
 *
 * Components call this instead of hand-rolling the split, so the prop list
 * lives in exactly one place and cannot drift between 40-odd call sites.
 *
 * Returns the resolved className plus the remaining props, which the caller
 * spreads onto its root as before — placement keys are removed, so none of
 * them can leak onto the DOM as an attribute.
 *
 * Channel props (margin, w/h, ... — see const/channel.ts) also produce custom
 * properties. Those are folded into `rest.style` here — channel vars first,
 * the caller's own `style` second, so user style always wins — which keeps
 * every call site that just spreads `rest` working unchanged.
 */
export function splitPlacement<T extends Record<string, unknown>>(
  props: T,
): {
  placementClass: string;
  /** Channel variables for the placement props. Already folded into
   *  `rest.style`, so call sites that spread `rest` can ignore this — it
   *  exists for the sites that discard `rest` and build the root's props by
   *  hand: apply it to the root's `style` yourself (own values and the
   *  caller's `style` AFTER it, so they win). */
  placementStyle: Record<string, string>;
  rest: Omit<T, PlacementPropName>;
} {
  const placement: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const key in props) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
    if (PLACEMENT_SET.has(key)) placement[key] = props[key];
    else rest[key] = props[key];
  }

  const resolved = resolveStyleProps(placement, {
    maps: boxVariantMap,
    variants: boxVariants,
  });

  if (Object.keys(resolved.style).length > 0) {
    rest.style = {
      ...resolved.style,
      ...(rest.style as Record<string, unknown> | undefined),
    };
  }

  return {
    placementClass: resolved.className,
    placementStyle: resolved.style,
    rest: rest as Omit<T, PlacementPropName>,
  };
}
