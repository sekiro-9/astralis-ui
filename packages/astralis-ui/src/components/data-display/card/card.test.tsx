import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Card } from "./index";

/**
 * Card size reaches the parts through CSS, not context: the root stamps
 * data-card-size and the parts carry parent-keyed variants on it. These tests
 * pin both halves of that contract — the attribute on the root, and the
 * always-present md default + override classes on the parts. If either side
 * drops its half, the compound quietly renders md at every size.
 */
describe("Card size via data attribute", () => {
  it("stamps data-card-size on the root", () => {
    const { container, rerender } = render(<Card size="sm">x</Card>);
    expect(container.firstElementChild?.getAttribute("data-card-size")).toBe("sm");

    rerender(<Card>x</Card>);
    expect(container.firstElementChild?.getAttribute("data-card-size")).toBe("md");
  });

  it("parts carry the md default and the sm/lg parent-keyed overrides", () => {
    const { getByText } = render(
      <Card size="lg">
        <Card.Body>body</Card.Body>
      </Card>,
    );

    const body = getByText("body").className;
    expect(body).toContain("astralis:px-5"); // md default, out-specified when a size is set
    expect(body).toContain("astralis:[[data-card-size=sm]_&]:px-4");
    expect(body).toContain("astralis:[[data-card-size=lg]_&]:px-7");
  });

  it("a part outside any root keeps the old silent-md contract", () => {
    const { getByText } = render(<Card.Body>orphan</Card.Body>);
    expect(getByText("orphan").className).toContain("astralis:px-5");
  });
});
