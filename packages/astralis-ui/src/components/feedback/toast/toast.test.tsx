import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Toaster, toast } from "./index";
import { getToasts, removeToast } from "./toast-store";
import { Modal } from "../../overlay/modal";

const FAKE = ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "Date"] as const;

const politeRegion = () => document.querySelector('[data-astralis-toast-announcer="polite"]') as HTMLElement;
const assertiveRegion = () => document.querySelector('[data-astralis-toast-announcer="assertive"]') as HTMLElement;
const panel = (title: string) =>
  within(screen.getByRole("region", { name: "Notifications" })).getByText(title).closest("[data-status]") as HTMLElement;
const isOpen = (title: string) => getToasts().some((t) => t.title === title && t.open);

function fire(options: Parameters<typeof toast>[0]) {
  act(() => {
    toast(options);
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: [...FAKE] });
});

afterEach(() => {
  act(() => getToasts().forEach((t) => removeToast(t.id)));
  vi.useRealTimers();
});

describe("Toast timers", () => {
  it("dismisses itself after its duration", () => {
    render(<Toaster />);
    fire({ title: "Saved", duration: 1000 });

    act(() => vi.advanceTimersByTime(999));
    expect(isOpen("Saved")).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(isOpen("Saved")).toBe(false);
  });

  it("pauses while hovered and resumes with the time that was left", () => {
    render(<Toaster />);
    fire({ title: "Saved", duration: 1000 });

    act(() => vi.advanceTimersByTime(600));
    fireEvent.mouseEnter(panel("Saved"));
    act(() => vi.advanceTimersByTime(5000));
    expect(isOpen("Saved")).toBe(true);

    fireEvent.mouseLeave(panel("Saved"));
    act(() => vi.advanceTimersByTime(399));
    expect(isOpen("Saved")).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(isOpen("Saved")).toBe(false);
  });

  it("pauses while focus is inside the toast, and moving focus within it keeps it paused", () => {
    render(<Toaster />);
    fire({ title: "Deleted", duration: 1000, action: { label: "Undo", onClick: () => {} } });

    const undo = screen.getByRole("button", { name: "Undo" });
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    act(() => undo.focus());
    act(() => close.focus());
    act(() => vi.advanceTimersByTime(5000));
    expect(isOpen("Deleted")).toBe(true);

    act(() => close.blur());
    act(() => vi.advanceTimersByTime(1000));
    expect(isOpen("Deleted")).toBe(false);
  });

  it("duration null keeps it until dismissed", () => {
    render(<Toaster />);
    fire({ title: "Sticky", duration: null });
    act(() => vi.advanceTimersByTime(60_000));
    expect(isOpen("Sticky")).toBe(true);
  });

  it("is removed from the store after the exit transition", () => {
    render(<Toaster />);
    fire({ title: "Bye", duration: 100 });
    act(() => vi.advanceTimersByTime(100));
    expect(getToasts()).toHaveLength(1);
    act(() => vi.advanceTimersByTime(200));
    expect(getToasts()).toHaveLength(0);
  });
});

describe("Toast announcements", () => {
  it("live regions exist empty before any toast, and gain the text afterwards", () => {
    render(<Toaster />);
    expect(politeRegion()).toBeInTheDocument();
    expect(politeRegion()).toBeEmptyDOMElement();
    expect(assertiveRegion()).toBeEmptyDOMElement();

    fire({ title: "Saved", description: "Your draft is safe" });
    expect(politeRegion()).toHaveTextContent("Saved. Your draft is safe");
    expect(assertiveRegion()).toBeEmptyDOMElement();

    fire({ title: "Upload failed", status: "error" });
    expect(assertiveRegion()).toHaveTextContent("Upload failed");

    act(() => vi.advanceTimersByTime(1000));
    expect(politeRegion()).toBeEmptyDOMElement();
    expect(assertiveRegion()).toBeEmptyDOMElement();
  });

  it("the visible toast is not itself a live region, so nothing is read twice", () => {
    render(<Toaster />);
    fire({ title: "Saved" });
    expect(panel("Saved")).not.toHaveAttribute("role");
  });
});

describe("Toast Escape", () => {
  it("Escape inside a toast dismisses it and returns focus, leaving the Modal under it open", () => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    render(
      <>
        <Modal defaultOpen>
          <Modal.Content>
            <Modal.Title>Editor</Modal.Title>
            <button>Save</button>
          </Modal.Content>
        </Modal>
        <Toaster />
      </>,
    );
    fire({ title: "Saved", duration: null });

    const save = screen.getByRole("button", { name: "Save" });
    act(() => save.focus());
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    act(() => close.focus());

    fireEvent.keyDown(close, { key: "Escape" });
    expect(isOpen("Saved")).toBe(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(save).toHaveFocus();
  });
});
