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

/**
 * Interaction states are resolved by the same engine as responsive props, so
 * they share the same silent-failure mode: an unrecognised state prop becomes a
 * DOM attribute, and an unrecognised token inside one vanishes without a trace.
 */
describe("interaction-state props", () => {
  it("resolve to state-prefixed classes", () => {
    const { container } = render(
      <Box bg="base" hover={{ bg: "subtle" }} focusVisible={{ borderColor: "brand" }} />,
    );

    expect(classesOf(container)).toEqual(
      expect.arrayContaining([
        "astralis:bg-surface-base",
        "astralis:hover:bg-surface-subtle",
        "astralis:focus-visible:border-brand-stroke",
      ]),
    );
  });

  it("never become DOM attributes", () => {
    const { container } = render(
      <Box hover={{ bg: "subtle" }} active={{ opacity: "high" }} />,
    );
    const el = container.firstElementChild!;

    expect(el.hasAttribute("hover")).toBe(false);
    expect(el.hasAttribute("active")).toBe(false);
    expect(el.hasAttribute("focusVisible")).toBe(false);
  });

  it("reach every Box-composing primitive, not just Box", () => {
    const { container } = render(<Flex hover={{ bg: "subtle" }} />);

    expect(classesOf(container)).toContain("astralis:hover:bg-surface-subtle");
  });

  it("leave `disabled` as a real HTML attribute", () => {
    // `disabled` is deliberately NOT a state prop: it collides with the native
    // attribute, and :disabled only matches form controls.
    const { container } = render(<Box as="button" disabled />);

    expect(container.firstElementChild!.hasAttribute("disabled")).toBe(true);
  });

  it("drop a token the base layer could not paint", () => {
    // @ts-expect-error — the type is the contract; this must not compile.
    const { container } = render(<Box hover={{ bg: "not-a-token" }} />);

    expect(classesOf(container).some((c) => c.includes("hover:"))).toBe(false);
  });
});
