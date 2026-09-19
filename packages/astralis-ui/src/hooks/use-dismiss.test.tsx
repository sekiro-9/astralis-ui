import { describe, expect, it, vi } from "vitest";
import { useRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useDismiss } from "./use-dismiss";
import { popOverlay, pushOverlay } from "../utils/overlay-stack";

function Layer({
  label,
  onClose,
  open = true,
  children,
}: {
  label: string;
  onClose: () => void;
  open?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // An inline options literal and ref array on purpose: identity changes on
  // every render must not re-register the layer.
  useDismiss(open, () => onClose(), { refs: [ref] });
  return (
    <div ref={ref} data-testid={label}>
      {children}
    </div>
  );
}

describe("useDismiss", () => {
  it("Escape closes the layer and outside pointerdown closes it; inside does not", () => {
    const onClose = vi.fn();
    render(
      <>
        <Layer label="panel" onClose={onClose}>
          <button>inside</button>
        </Layer>
        <button>outside</button>
      </>,
    );

    fireEvent.pointerDown(screen.getByText("inside"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText("outside"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps its stack position when the parent re-renders (Escape closes the nested layer only)", () => {
    const outerClose = vi.fn();
    const innerClose = vi.fn();

    function Harness() {
      const [, setTick] = useState(0);
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>rerender</button>
          <button onClick={() => setInnerOpen(true)}>open inner</button>
          <Layer label="outer" onClose={outerClose}>
            <Layer label="inner" open={innerOpen} onClose={innerClose} />
          </Layer>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByText("open inner"));
    // Before the fix the outer layer popped and re-pushed here, landing above
    // the inner one.
    fireEvent.click(screen.getByText("rerender"));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(innerClose).toHaveBeenCalledTimes(1);
    expect(outerClose).not.toHaveBeenCalled();
  });

  it("calls the latest onClose, not the one captured when it opened", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Layer label="p" onClose={first} />);
    rerender(<Layer label="p" onClose={second} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("a pointerdown inside a higher, portaled layer is not outside", () => {
    const onClose = vi.fn();
    render(<Layer label="popover" onClose={onClose} />);

    // A picker's listbox portaled to body, opened from inside the popover.
    const listbox = document.createElement("div");
    document.body.appendChild(listbox);
    const listboxLayer = pushOverlay({ contains: (node) => listbox.contains(node) });

    fireEvent.pointerDown(listbox);
    expect(onClose).not.toHaveBeenCalled();

    popOverlay(listboxLayer);
    listbox.remove();
  });

  it("does nothing while closed or disabled", () => {
    const onClose = vi.fn();
    function Closed({ open, enabled }: { open: boolean; enabled: boolean }) {
      const ref = useRef<HTMLDivElement>(null);
      useDismiss(open, onClose, { refs: [ref], enabled });
      return <div ref={ref} />;
    }
    const { rerender } = render(<Closed open={false} enabled />);
    fireEvent.keyDown(document, { key: "Escape" });
    rerender(<Closed open enabled={false} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("respects closeOnEscape and closeOnOutsidePointer", () => {
    const onClose = vi.fn();
    function Configured() {
      const ref = useRef<HTMLDivElement>(null);
      useDismiss(true, onClose, { refs: [ref], closeOnEscape: false, closeOnOutsidePointer: false });
      return <div ref={ref} />;
    }
    render(<Configured />);
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.pointerDown(document.body);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
