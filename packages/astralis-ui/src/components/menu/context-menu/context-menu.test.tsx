import { afterEach, describe, expect, it, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { ContextMenu } from "./index";

function Fixture({ onSelect = () => {} }: { onSelect?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div data-testid="zone">Right-click me</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={onSelect}>Rename</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item danger>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  it("opens Menu's content at a pointer-anchored point on contextmenu", async () => {
    const { getByTestId, baseElement } = render(<Fixture />);
    expect(baseElement.querySelector('[role="menu"]')).toBeNull();
    fireEvent.contextMenu(getByTestId("zone"), { clientX: 120, clientY: 80 });
    await waitFor(() => expect(baseElement.querySelector('[role="menu"]')).not.toBeNull());
    // The virtual anchor sits exactly under the pointer.
    const anchor = [...baseElement.querySelectorAll("span")].find((s) => s.style.position === "fixed");
    expect(anchor?.style.left).toBe("120px");
    expect(anchor?.style.top).toBe("80px");
  });

  it("activating an item runs onSelect and closes", async () => {
    const onSelect = vi.fn();
    const { getByTestId, getByText, baseElement } = render(<Fixture onSelect={onSelect} />);
    fireEvent.contextMenu(getByTestId("zone"), { clientX: 10, clientY: 10 });
    await waitFor(() => expect(baseElement.querySelector('[role="menu"]')).not.toBeNull());
    fireEvent.click(getByText("Rename"));
    expect(onSelect).toHaveBeenCalled();
    await waitFor(() => expect(baseElement.querySelector('[role="menu"]')).toBeNull());
  });
});

describe("ContextMenu repositioning", () => {
  afterEach(() => vi.restoreAllMocks());

  it("a second right-click moves the open menu without a global resize event", async () => {
    // jsdom has no layout: the fixed-position anchor reports its own left/top.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const left = parseFloat(this.style.left) || 0;
      const top = parseFloat(this.style.top) || 0;
      const fixed = this.style.position === "fixed";
      const width = fixed ? 1 : 0;
      const height = fixed ? 1 : 0;
      return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) } as DOMRect;
    });
    const onResize = vi.fn();
    window.addEventListener("resize", onResize);

    const { getByTestId, baseElement } = render(<Fixture />);
    fireEvent.contextMenu(getByTestId("zone"), { clientX: 40, clientY: 50 });
    const menu = await waitFor(() => baseElement.querySelector<HTMLElement>('[role="menu"]')!);
    await waitFor(() => expect(menu.style.left).toBe("40px"));

    fireEvent.contextMenu(getByTestId("zone"), { clientX: 300, clientY: 200 });
    await waitFor(() => expect(menu.style.left).toBe("300px"));
    expect(menu.style.top).toBe("203px"); // 200 + 1px anchor + sideOffset 2
    expect(onResize).not.toHaveBeenCalled();

    window.removeEventListener("resize", onResize);
  });
});
