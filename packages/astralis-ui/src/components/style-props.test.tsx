import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Box, Flex, Grid } from "./index";

/**
 * A guarantee that is easy to break silently, because breaking it still
 * renders: a style prop that stops being recognised becomes a stray DOM
 * attribute rather than a class, and nothing fails.
 */

function classesOf(container: HTMLElement): string[] {
  return [...container.firstElementChild!.classList];
}

describe("self-placement props", () => {
  it("resolve on any primitive, not only Flex.Item", () => {
    const { container } = render(<Flex shrink="0" grow="1" />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:shrink-0", "astralis:grow"]),
    );
  });

  it("become classes rather than DOM attributes", () => {
    const { container } = render(<Box shrink="0" order="2" alignSelf="center" />);
    const el = container.firstElementChild!;

    expect(el.hasAttribute("shrink")).toBe(false);
    expect(el.hasAttribute("order")).toBe(false);
    expect(el.hasAttribute("alignSelf")).toBe(false);
    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:shrink-0", "astralis:order-2", "astralis:self-center"]),
    );
  });

  it("accept a responsive map like every other style prop", () => {
    const { container } = render(<Box alignSelf={{ base: "start", lg: "center" }} />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:self-start", "astralis:lg:self-center"]),
    );
  });
});

describe("display on a layout container", () => {
  /*
   * Flex and Grid emit their own display from a cva base, and `display` is the
   * one key they share with Box. Merged in the wrong order the base class wins
   * and the explicit prop is dropped — which typechecks, renders, and leaves a
   * responsively-hidden nav visible at every width.
   */
  it("Flex honours an explicit display over its own flex base", () => {
    const { container } = render(<Flex display={{ base: "hidden", md: "flex" }} />);
    const classes = classesOf(container);

    expect(classes).toContain("astralis:hidden");
    expect(classes).toContain("astralis:md:flex");
    expect(classes).not.toContain("astralis:flex");
  });

  it("Grid honours an explicit display over its own grid base", () => {
    const { container } = render(<Grid display="hidden" />);
    const classes = classesOf(container);

    expect(classes).toContain("astralis:hidden");
    expect(classes).not.toContain("astralis:grid");
  });

  it("still emits the container recipe when display is not overridden", () => {
    const { container } = render(<Flex direction="column" gap="4" />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:flex", "astralis:flex-col", "astralis:gap-4"]),
    );
  });
});
