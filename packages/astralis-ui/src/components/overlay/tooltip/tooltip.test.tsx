import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./index";
import { Popover } from "../popover";
import { Modal } from "../modal";

function Fixture({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Tooltip delay={300} onOpenChange={onOpenChange}>
      <Tooltip.Trigger>
        <button>Save</button>
      </Tooltip.Trigger>
      <Tooltip.Content>Save the draft</Tooltip.Content>
    </Tooltip>
  );
}

describe("Tooltip timing", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows after the delay on hover and hides on leave", () => {
    render(<Fixture />);
    fireEvent.mouseEnter(screen.getByText("Save"));
    expect(screen.queryByRole("tooltip")).toBeNull();

    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Save the draft");
    expect(screen.getByText("Save")).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);

    fireEvent.mouseLeave(screen.getByText("Save"));
    expect(screen.getByText("Save")).not.toHaveAttribute("aria-describedby");
  });

  it("keyboard focus shows it at once", () => {
    render(<Fixture />);
    fireEvent.focus(screen.getByText("Save"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("a pending show is cancelled when the tooltip unmounts", () => {
    const onOpenChange = vi.fn();
    const { unmount } = render(<Fixture onOpenChange={onOpenChange} />);
    fireEvent.mouseEnter(screen.getByText("Save"));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("Tooltip dismissal", () => {
  it("Escape closes a tooltip inside a Modal without closing the Modal", async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Content>
          <Modal.Title>Settings</Modal.Title>
          <Tooltip>
            <Tooltip.Trigger>
              <button>Help</button>
            </Tooltip.Trigger>
            <Tooltip.Content>More about settings</Tooltip.Content>
          </Tooltip>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(screen.getByText("Help")).toHaveFocus());
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByText("Help")).not.toHaveAttribute("aria-describedby"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("Trigger refs", () => {
  beforeEach(() => {
    // jsdom has no layout: the button sits at (100, 200); panels are 0x0.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const isButton = this.tagName === "BUTTON";
      const left = isButton ? 100 : 0;
      const top = isButton ? 200 : 0;
      const width = isButton ? 80 : 0;
      const height = isButton ? 30 : 0;
      return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) } as DOMRect;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("a Tooltip around a Popover trigger keeps both anchors and the consumer's ref", async () => {
    const user = userEvent.setup();
    const buttonRef = createRef<HTMLButtonElement>();
    render(
      <Popover>
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Popover.Trigger>
              <button ref={buttonRef}>Share</button>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Content>Share this page</Tooltip.Content>
        </Tooltip>
        <Popover.Content>
          <Popover.Title>Share</Popover.Title>
        </Popover.Content>
      </Popover>,
    );

    expect(buttonRef.current).toBe(screen.getByRole("button", { name: "Share" }));

    fireEvent.focus(buttonRef.current!);
    // Anchored to the button: centred on x = 100 + 80 / 2, not stranded at 0.
    await waitFor(() => expect(screen.getByRole("tooltip").style.left).toBe("140px"));

    await user.click(buttonRef.current!);
    const panel = await screen.findByRole("dialog");
    await waitFor(() => expect(panel.style.top).toBe("238px")); // 200 + 30 + 8
  });
});
