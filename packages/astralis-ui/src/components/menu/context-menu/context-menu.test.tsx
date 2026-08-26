import { describe, expect, it, vi } from "vitest";
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
