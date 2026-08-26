import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Toolbar } from "./index";

describe("Toolbar", () => {
  it("renders role=toolbar with label, orientation and grouped children", () => {
    const { container } = render(
      <Toolbar label="Formatting">
        <Toolbar.Group>
          <button>Bold</button>
          <button>Italic</button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <button>Link</button>
      </Toolbar>,
    );
    const bar = container.querySelector('[role="toolbar"]')!;
    expect(bar.getAttribute("aria-label")).toBe("Formatting");
    expect(bar.getAttribute("aria-orientation")).toBe("horizontal");
    expect(container.querySelector('[role="group"]')).not.toBeNull();
  });

  it("arrow keys move focus between the focusable children", () => {
    const { container, getByText } = render(
      <Toolbar label="Formatting">
        <button>Bold</button>
        <button>Italic</button>
        <button>Link</button>
      </Toolbar>,
    );
    getByText("Bold").focus();
    fireEvent.keyDown(container.querySelector('[role="toolbar"]')!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(getByText("Italic"));
    fireEvent.keyDown(container.querySelector('[role="toolbar"]')!, { key: "End" });
    expect(document.activeElement).toBe(getByText("Link"));
  });
});
