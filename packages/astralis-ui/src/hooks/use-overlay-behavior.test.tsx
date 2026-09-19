import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useOverlayBehavior } from "./use-overlay-behavior";
import { popOverlay, pushOverlay } from "../utils/overlay-stack";

function Dialog({
  open,
  setOpen,
  closeOnEsc,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  closeOnEsc?: boolean;
  children: React.ReactNode;
}) {
  const { containerRef } = useOverlayBehavior(open, setOpen, { closeOnEsc });
  if (!open) return null;
  return (
    <div ref={containerRef} role="dialog" tabIndex={-1}>
      {children}
    </div>
  );
}

describe("useOverlayBehavior", () => {
  it("focuses the first tabbable on open and restores focus on close", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <Dialog open={open} setOpen={setOpen}>
            <button onClick={() => setOpen(false)}>first</button>
          </Dialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("open"));
    await waitFor(() => expect(screen.getByText("first")).toHaveFocus());

    await user.click(screen.getByText("first"));
    expect(screen.getByText("open")).toHaveFocus();
  });

  it("keeps focus where it is when the parent re-renders with a new setOpen", async () => {
    function Harness() {
      const [text, setText] = useState("");
      return (
        // A fresh setOpen every render — the inline-onOpenChange shape.
        <Dialog open setOpen={(o) => void o}>
          <input aria-label="first" />
          <input aria-label="second" value={text} onChange={(e) => setText(e.target.value)} />
        </Dialog>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    await waitFor(() => expect(screen.getByLabelText("first")).toHaveFocus());

    await user.click(screen.getByLabelText("second"));
    await user.keyboard("abc");
    // Wait past the deferred initial-focus timer a re-run would schedule.
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByLabelText("second")).toHaveFocus();
    expect(screen.getByLabelText("second")).toHaveValue("abc");
  });

  it("Tab wraps inside the container and skips hidden and inert elements", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open setOpen={() => {}}>
        <button>one</button>
        <button>two</button>
        {/* A collapsed Accordion panel and an inactive Tabs panel after the
            last reachable control: the trap must wrap from "two". */}
        <div hidden>
          <button>collapsed</button>
        </div>
        <div inert>
          <button>inert</button>
        </div>
      </Dialog>,
    );
    await waitFor(() => expect(screen.getByText("one")).toHaveFocus());

    await user.tab();
    expect(screen.getByText("two")).toHaveFocus();
    await user.tab();
    expect(screen.getByText("one")).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText("two")).toHaveFocus();
  });

  it("a transient layer above (an open tooltip) does not suspend the trap", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open setOpen={() => {}}>
        <button>one</button>
        <button>two</button>
      </Dialog>,
    );
    await waitFor(() => expect(screen.getByText("one")).toHaveFocus());
    const tooltip = pushOverlay({ transient: true });

    await user.tab();
    await user.tab();
    expect(screen.getByText("one")).toHaveFocus();
    popOverlay(tooltip);
  });

  it("Escape calls the latest setOpen, and only while topmost", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <Dialog open setOpen={first}>
        <button>x</button>
      </Dialog>,
    );
    rerender(
      <Dialog open setOpen={latest}>
        <button>x</button>
      </Dialog>,
    );

    const above = pushOverlay();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(latest).not.toHaveBeenCalled();
    popOverlay(above);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith(false);
  });

  it("closeOnEsc={false} ignores Escape", () => {
    const setOpen = vi.fn();
    render(
      <Dialog open setOpen={setOpen} closeOnEsc={false}>
        <button>x</button>
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("locks body scroll while open", () => {
    const { unmount } = render(
      <Dialog open setOpen={() => {}}>
        <button>x</button>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
