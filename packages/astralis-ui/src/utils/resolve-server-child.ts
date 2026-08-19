import type { ReactNode } from "react";

const REACT_LAZY = Symbol.for("react.lazy");

interface LazyNode {
  $$typeof: symbol;
  _payload: unknown;
  _init: (payload: unknown) => ReactNode;
}

const isLazyNode = (node: unknown): node is LazyNode =>
  typeof node === "object" &&
  node !== null &&
  (node as { $$typeof?: symbol }).$$typeof === REACT_LAZY;

/**
 * Children a Server Component passes into a client component arrive during
 * hydration as React.lazy nodes wrapping the RSC payload — NOT as plain
 * elements. `cloneElement` on one produces "Element type is invalid:
 * … got: undefined", and `isValidElement` filters silently drop it. (The
 * server render never sees this: there the children are real elements, which
 * is why the mismatch only appears in the browser.)
 *
 * Unwrapping mirrors what React itself does before rendering a lazy node. If
 * the payload is somehow still streaming, `_init` throws the pending promise
 * and the component suspends — the same behavior rendering the node directly
 * would have.
 */
export function resolveServerChild(node: ReactNode): ReactNode {
  let current: ReactNode = node;
  while (isLazyNode(current)) {
    current = current._init(current._payload) as ReactNode;
  }
  return current;
}
