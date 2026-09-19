import { useMemo, type Ref, type RefCallback } from "react";

type PossibleRef<T> = Ref<T> | undefined | null;

function assign<T>(ref: PossibleRef<T>, node: T | null): (() => void) | void {
  if (typeof ref === "function") return ref(node) ?? undefined;
  if (ref) ref.current = node;
}

/** One ref that feeds every ref given, object or callback, including React 19
 *  callback cleanups. */
export function mergeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => assign(ref, node));
    return () => {
      cleanups.forEach((cleanup, i) => (cleanup ? cleanup() : assign(refs[i], null)));
    };
  };
}

/** `mergeRefs` with a stable identity while the refs themselves are stable, so
 *  the node is not detached and re-attached on every render. */
export function useMergedRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the refs are the dependencies
  return useMemo(() => mergeRefs(...refs), refs);
}
