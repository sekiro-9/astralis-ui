"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Controlled/uncontrolled state helper. When `value` is provided the state is
 * controlled; otherwise it falls back to internal state seeded by `defaultValue`.
 * `onChange` always fires.
 *
 * The setter's identity never changes. Effects that depend on it (overlay focus
 * traps, dismiss listeners) would otherwise re-run on every parent render
 * whenever `onChange` is an inline arrow.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): readonly [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const state = isControlled ? (value as T) : uncontrolled;

  const latest = useRef({ isControlled, onChange });
  useLayoutEffect(() => {
    latest.current = { isControlled, onChange };
  });

  const wasControlled = useRef(isControlled);
  useLayoutEffect(() => {
    if (wasControlled.current !== isControlled && process.env.NODE_ENV !== "production") {
      console.warn(
        `[astralis] A component switched from ${wasControlled.current ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. Pass \`value\` for the component's whole lifetime, or never.`,
      );
    }
    wasControlled.current = isControlled;
  }, [isControlled]);

  const setState = useCallback((next: T) => {
    if (!latest.current.isControlled) setUncontrolled(next);
    latest.current.onChange?.(next);
  }, []);

  return [state, setState] as const;
}
