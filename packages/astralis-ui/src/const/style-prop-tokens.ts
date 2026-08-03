import { boxVariantMap } from "../components/layout/box/box.styles";
import { flexVariantMap } from "../components/layout/flex/flex.style";
import { gridVariantMap } from "../components/layout/grid/grid.styles";

/**
 * The VALUES each style prop accepts, keyed by prop name.
 *
 * Derived from the same token maps the components resolve against, so this can
 * never drift from what actually paints — which matters more here than usual,
 * because a value outside these maps produces no class at all and the prop
 * silently does nothing.
 *
 * Deliberately the vocabulary and not the maps themselves: the class strings
 * are an implementation detail, and publishing them would freeze the internals.
 * What a consumer needs is "what may I pass to `p`?", which is a fair question
 * to answer and useful for building pickers, docs and codemods.
 */
export type StylePropTokens = Readonly<Record<string, readonly string[]>>;

const vocabulary = (map: Record<string, Record<string, string>>): StylePropTokens =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(map).map(([prop, tokens]) => [prop, Object.freeze(Object.keys(tokens))]),
    ),
  );

/** Spacing, sizing, colour, border and radius props — everything Box resolves. */
export const BOX_STYLE_TOKENS: StylePropTokens = vocabulary(boxVariantMap);

/** Flex's own layout props. Flex also accepts every Box prop. */
export const FLEX_STYLE_TOKENS: StylePropTokens = vocabulary({
  ...boxVariantMap,
  ...flexVariantMap,
});

/** Grid's own layout props. Grid also accepts every Box prop. */
export const GRID_STYLE_TOKENS: StylePropTokens = vocabulary({
  ...boxVariantMap,
  ...gridVariantMap,
});
