const groupSets = new WeakMap<readonly string[], ReadonlySet<string>>();

/** Key groups are module constants, so each Set is built once, not per render. */
function setOf(group: readonly string[]): ReadonlySet<string> {
  let set = groupSets.get(group);
  if (!set) {
    set = new Set(group);
    groupSets.set(group, set);
  }
  return set;
}

/**
 * Splits a props bag into one bucket per key group, plus a trailing bucket of
 * everything unclaimed (the DOM props). A key goes to the FIRST group that
 * lists it, so pass a component's own variant keys before the Box keys.
 *
 *   const [variantProps, boxProps, htmlProps] =
 *     splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);
 */
export function splitVariantProps(
  props: object,
  ...keyGroups: ReadonlyArray<readonly string[]>
): Record<string, unknown>[] {
  const sets = keyGroups.map(setOf);
  const buckets = keyGroups.map((): Record<string, unknown> => ({}));
  const htmlProps: Record<string, unknown> = {};
  const source = props as Record<string, unknown>;

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    let target = htmlProps;
    for (let i = 0; i < sets.length; i++) {
      if (sets[i].has(key)) {
        target = buckets[i];
        break;
      }
    }
    target[key] = source[key];
  }

  return [...buckets, htmlProps];
}
