import { PLACEMENT_PROP_NAMES } from "../../../utils/placement";
import { STATE_PROP_NAMES, type StatePropName } from "../../../utils/interaction-state";
import type { TextStateProps } from "./text.types";

const TEXT_STATE_KEYS = new Set<string>(["color", ...PLACEMENT_PROP_NAMES]);

/**
 * Text's state props, cut down to what Text may carry (see TextStateStyles),
 * ready for `resolveStyleProps`. The resolver itself accepts every stateable
 * prop, as Box does, so a JavaScript caller's `hover={{ bg }}` would otherwise
 * paint a background Text has no base prop for.
 */
export function textStates(props: TextStateProps): Partial<Record<StatePropName, Record<string, unknown>>> {
  const out: Partial<Record<StatePropName, Record<string, unknown>>> = {};
  for (const state of STATE_PROP_NAMES) {
    const styles = props[state];
    if (!styles || typeof styles !== "object") continue;
    const kept: Record<string, unknown> = {};
    for (const key in styles) if (TEXT_STATE_KEYS.has(key)) kept[key] = (styles as Record<string, unknown>)[key];
    out[state] = kept;
  }
  return out;
}
