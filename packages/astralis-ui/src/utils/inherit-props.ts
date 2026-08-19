import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { resolveServerChild } from "./resolve-server-child";

/**
 * Server-side prop inheritance for compound components — the replacement for
 * the stateless contexts the roots used to provide. The root clones its
 * DIRECT element children, and any child whose type is a key of `rules`
 * receives that rule's props merged UNDER its own (an explicit prop on the
 * child always wins, matching the old context-with-local-override behavior).
 *
 * Matching is by component identity, not displayName: the root imports its
 * parts anyway, and identity survives minification.
 *
 * Deliberately direct-children-only. The contexts reached through wrapper
 * elements; cloning does not — a part inside a wrapper falls back to its own
 * defaults. Direct composition is the documented pattern, and the 0.7.2
 * changelog calls the difference out.
 */
export function inheritProps(
  children: ReactNode,
  rules: Map<unknown, Record<string, unknown>>,
): ReactNode {
  // Unwrap first: when a CLIENT component inherits (Avatar → Badge), server-
  // created children hydrate as React.lazy nodes; matching the unwrapped
  // element keeps the client render identical to the server one.
  return Children.map(resolveServerChild(children), (rawChild) => {
    const child = resolveServerChild(rawChild);
    if (!isValidElement(child)) return child;
    const inherited = rules.get(child.type);
    if (!inherited) return child;
    const own = child.props as Record<string, unknown>;
    const add: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(inherited)) {
      if (own[key] === undefined) add[key] = value;
    }
    return Object.keys(add).length ? cloneElement(child, add) : child;
  });
}
