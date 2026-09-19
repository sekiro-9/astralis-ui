import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { mergeRefs } from "./merge-refs";

describe("mergeRefs", () => {
  it("feeds object and callback refs the same node", () => {
    const objectRef = createRef<string>();
    const callbackRef = vi.fn();
    mergeRefs(objectRef, callbackRef, undefined, null)("node");

    expect(objectRef.current).toBe("node");
    expect(callbackRef).toHaveBeenCalledWith("node");
  });

  it("clears every ref on detach", () => {
    const objectRef = createRef<string>();
    const callbackRef = vi.fn();
    const detach = mergeRefs(objectRef, callbackRef)("node");
    (detach as () => void)();

    expect(objectRef.current).toBeNull();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
  });

  it("runs a callback ref's own cleanup instead of calling it with null", () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn(() => cleanup);
    const detach = mergeRefs(callbackRef)("node");
    (detach as () => void)();

    expect(cleanup).toHaveBeenCalledOnce();
    expect(callbackRef).toHaveBeenCalledTimes(1);
  });
});
