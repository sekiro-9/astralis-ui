import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Splitter } from "./index";

function Fixture(props: { onResize?: (n: number) => void; defaultSize?: number }) {
  return (
    <Splitter defaultSize={30} minSize={20} maxSize={80} {...props}>
      <Splitter.Panel>left</Splitter.Panel>
      <Splitter.Handle />
      <Splitter.Panel>right</Splitter.Panel>
    </Splitter>
  );
}

describe("Splitter", () => {
  it("exposes the APG separator contract and drives the size CSS variable", () => {
    const { container } = render(<Fixture />);
    const handle = container.querySelector('[role="separator"]')!;
    expect(handle.getAttribute("aria-valuenow")).toBe("30");
    expect(handle.getAttribute("aria-valuemin")).toBe("20");
    expect(handle.getAttribute("aria-valuemax")).toBe("80");
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--astralis-splitter-size")).toBe("30%");
  });

  it("arrow keys resize by steps, Home/End jump, clamped to min/max", () => {
    const onResize = vi.fn();
    const { container } = render(<Fixture onResize={onResize} />);
    const handle = container.querySelector('[role="separator"]')!;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onResize).toHaveBeenLastCalledWith(32);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(onResize).toHaveBeenLastCalledWith(20);
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    // Already at min — clamped, no movement below 20.
    expect(onResize).toHaveBeenLastCalledWith(20);
    fireEvent.keyDown(handle, { key: "End" });
    expect(onResize).toHaveBeenLastCalledWith(80);
  });
});
