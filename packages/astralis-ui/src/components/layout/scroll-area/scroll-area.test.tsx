import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ScrollArea } from "./index";

describe("ScrollArea", () => {
  it("is keyboard focusable, so its content can be scrolled without a pointer", () => {
    const { container } = render(<ScrollArea maxH="40">content</ScrollArea>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.tabIndex).toBe(0);
    root.focus();
    expect(document.activeElement).toBe(root);
  });

  it("lets the caller opt out of the tab stop", () => {
    const { container } = render(<ScrollArea tabIndex={-1}>content</ScrollArea>);
    expect((container.firstElementChild as HTMLElement).tabIndex).toBe(-1);
  });

  it("takes its height as a placement prop", () => {
    const { container } = render(<ScrollArea maxH="40">content</ScrollArea>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.classList.contains("astralis-max-h")).toBe(true);
    expect(root.hasAttribute("maxh")).toBe(false);
  });
});
