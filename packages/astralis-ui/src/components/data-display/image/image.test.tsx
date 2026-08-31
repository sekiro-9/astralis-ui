import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Image } from "./index";

/**
 * The DOM remainder (id, data-*, aria-*) has to land on whichever element is
 * outermost, because that is the element a caller can point at: a builder
 * addresses the node it placed, a test addresses the thing it rendered.
 */
describe("Image forwards DOM props to its outermost element", () => {
  it("onto the img when it stands alone", () => {
    const { container } = render(<Image src="/a.png" alt="a" data-node="n1" />);
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("IMG");
    expect(outer?.getAttribute("data-node")).toBe("n1");
  });

  it("onto the ratio box when an aspect ratio wraps it", () => {
    const { container } = render(
      <Image src="/a.png" alt="a" aspectRatio="video" data-node="n2" />,
    );
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("DIV");
    expect(outer?.getAttribute("data-node")).toBe("n2");
    expect(container.querySelector("img")?.getAttribute("data-node")).toBeNull();
  });

  it("onto the figure when a caption wraps it", () => {
    const { container } = render(
      <Image src="/a.png" alt="a" caption="c" data-node="n3" />,
    );
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("FIGURE");
    expect(outer?.getAttribute("data-node")).toBe("n3");
  });
});
