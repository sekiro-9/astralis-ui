import { STATE_PROP_NAMES } from "../../../utils/interaction-state";
import { PROP_ALIASES } from "../../../const/prop-aliases";
import { boxVariantMap } from "./box.styles";

/**
 * Every key a Box-composing primitive routes into `resolveStyleProps` rather
 * than onto the DOM: the style props, their long-form aliases, the
 * interaction states, and `container`. Lives apart from box.styles.ts because
 * interaction-state imports that file.
 */
export const BOX_VARIANT_KEYS: readonly string[] = [
  ...Object.keys(boxVariantMap),
  ...Object.keys(PROP_ALIASES),
  ...STATE_PROP_NAMES,
  "container",
];
