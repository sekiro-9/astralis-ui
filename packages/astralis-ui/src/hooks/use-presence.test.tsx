import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePresence } from "./use-presence";

describe("usePresence", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("mounts in the same render it opens, then flips to open after two frames", () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 200), { initialProps: { open: false } });
    expect(result.current).toEqual({ mounted: false, state: "closed" });

    rerender({ open: true });
    expect(result.current).toEqual({ mounted: true, state: "closed" });

    act(() => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(result.current).toEqual({ mounted: true, state: "open" });
  });

  it("stays mounted through the exit transition, then unmounts", () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 200), { initialProps: { open: true } });
    expect(result.current).toEqual({ mounted: true, state: "open" });

    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, state: "closed" });

    act(() => vi.advanceTimersByTime(199));
    expect(result.current.mounted).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.mounted).toBe(false);
  });

  it("reopening during the exit keeps it mounted", () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 200), { initialProps: { open: true } });
    rerender({ open: false });
    act(() => vi.advanceTimersByTime(100));
    rerender({ open: true });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.mounted).toBe(true);
  });
});
