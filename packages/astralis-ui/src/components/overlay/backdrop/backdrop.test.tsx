import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Backdrop } from "./index";
import { VisuallyHidden } from "../../layout/visually-hidden";

describe("Backdrop", () => {
  it("paints the scrim inline and centers children when given any", () => {
    const { container } = render(<Backdrop>wait…</Backdrop>);
    const scrim = container.firstElementChild as HTMLElement;
    expect(scrim.style.backgroundColor).toBeTruthy();
    expect(scrim.className).toContain("astralis:items-center");
  });

  it("style overrides win over the default scrim colour", () => {
    const { container } = render(<Backdrop style={{ backgroundColor: "rgb(1, 2, 3)" }} />);
    expect((container.firstElementChild as HTMLElement).style.backgroundColor).toBe("rgb(1, 2, 3)");
  });
});

describe("VisuallyHidden", () => {
  it("renders sr-only content that stays in the accessibility tree", () => {
    const { container } = render(<VisuallyHidden>Save document</VisuallyHidden>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("astralis:sr-only");
    expect(span.textContent).toBe("Save document");
  });
});
