import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
  it("keeps the setter's identity across renders with a new inline onChange", () => {
    const { result, rerender } = renderHook(
      ({ onChange }) => useControllableState({ defaultValue: false, onChange }),
      { initialProps: { onChange: () => {} } },
    );
    const first = result.current[1];
    rerender({ onChange: () => {} });

    expect(result.current[1]).toBe(first);
  });

  it("calls the latest onChange, not the one from the first render", () => {
    const stale = vi.fn();
    const fresh = vi.fn();
    const { result, rerender } = renderHook(
      ({ onChange }) => useControllableState({ defaultValue: 0, onChange }),
      { initialProps: { onChange: stale } },
    );
    rerender({ onChange: fresh });
    act(() => result.current[1](1));

    expect(stale).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledWith(1);
  });

  it("updates internal state only when uncontrolled", () => {
    const uncontrolled = renderHook(() => useControllableState({ defaultValue: "a" }));
    act(() => uncontrolled.result.current[1]("b"));
    expect(uncontrolled.result.current[0]).toBe("b");

    const controlled = renderHook(() => useControllableState({ value: "a", defaultValue: "z" }));
    act(() => controlled.result.current[1]("b"));
    expect(controlled.result.current[0]).toBe("a");
  });
});
