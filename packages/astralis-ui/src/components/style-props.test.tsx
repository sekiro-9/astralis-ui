import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { CSSProperties } from "react";
import { Box, Card, Flex, Grid, Stack, HStack, VStack } from "./index";

/**
 * A guarantee that is easy to break silently, because breaking it still
 * renders: a style prop that stops being recognised becomes a stray DOM
 * attribute rather than a class, and nothing fails.
 */

function classesOf(container: HTMLElement): string[] {
  return [...container.firstElementChild!.classList];
}

/** Channel props deliver their value through a custom property on `style`. */
function styleVarOf(container: HTMLElement, name: string): string {
  return (container.firstElementChild as HTMLElement).style.getPropertyValue(name);
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
    // shrink/alignSelf are keyword classes; order is a channel prop.
    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:shrink-0", "astralis-order", "astralis:self-center"]),
    );
    expect(styleVarOf(container, "--astralis-order")).toBe("2");
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
      expect.arrayContaining(["astralis:flex", "astralis:flex-col", "astralis-gap"]),
    );
    expect(styleVarOf(container, "--astralis-gap")).toBe("var(--astralis-spacing-4)");
  });
});

/*
 * The one default that used to contradict CSS. `alignItems: "start"` in Flex's
 * defaultVariants meant a bare <Flex> refused to stretch its children — valid
 * props, valid classes, non-empty markup, clean typecheck, collapsed layout.
 * These assertions are the only gate that can see it, so they're deliberately
 * written against the ABSENCE of a class.
 */
describe("cross-axis alignment defaults", () => {
  it("leaves a bare Flex at CSS's stretch — no items-* class at all", () => {
    const { container } = render(<Flex />);

    expect(classesOf(container).some((c) => /^astralis:items-/.test(c))).toBe(false);
  });

  it("leaves VStack children stretching to the column width", () => {
    const { container } = render(<VStack />);

    expect(classesOf(container).some((c) => /^astralis:items-/.test(c))).toBe(false);
  });

  it("keeps HStack's centred preset, which is a choice rather than a default", () => {
    const { container } = render(<HStack />);

    expect(classesOf(container)).toContain("astralis:items-center");
  });

  it("still honours an explicit alignItems", () => {
    const { container } = render(<Flex alignItems="start" />);

    expect(classesOf(container)).toContain("astralis:items-start");
  });
});

describe("Stack direction", () => {
  it("translates the axis vocabulary to flex directions", () => {
    const { container } = render(<Stack direction="horizontal" />);

    expect(classesOf(container)).toContain("astralis:flex-row");
  });

  it("accepts a breakpoint map — the stack-then-row layout Flex used to own", () => {
    const { container } = render(<Stack direction={{ base: "vertical", md: "horizontal" }} />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis:flex-col", "astralis:md:flex-row"]),
    );
  });

  it("never leaks the axis word onto the DOM", () => {
    const { container } = render(<Stack direction={{ base: "vertical", md: "horizontal" }} />);

    expect(container.firstElementChild!.hasAttribute("direction")).toBe(false);
  });
});

/*
 * The values a layout author reaches for by reflex. Each was absent from its
 * scale, so the canonical spelling was a compile error and blocks grew spacer
 * elements instead. Spacing is a channel now: the class is fixed per prop and
 * the value rides a custom property.
 */
describe("scale sentinels", () => {
  it("pushes a flex item with an auto margin", () => {
    const { container } = render(<Box ml="auto" />);

    expect(classesOf(container)).toContain("astralis-ml");
    expect(styleVarOf(container, "--astralis-ml")).toBe("auto");
  });

  it("centres a fixed-width block with mx auto", () => {
    const { container } = render(<Box w="md" mx="auto" />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis-w", "astralis-mx"]),
    );
    expect(styleVarOf(container, "--astralis-w")).toBe("var(--astralis-size-md)");
    expect(styleVarOf(container, "--astralis-mx")).toBe("auto");
  });

  it("allows min-width zero, the flex truncation fix", () => {
    const { container } = render(<Box minW="0" />);

    expect(classesOf(container)).toContain("astralis-min-w");
    expect(styleVarOf(container, "--astralis-min-w")).toBe("0");
  });

  it("allows a zero gap to be stated rather than omitted", () => {
    const { container } = render(<Flex gap="0" />);

    expect(classesOf(container)).toContain("astralis-gap");
    expect(styleVarOf(container, "--astralis-gap")).toBe("0");
  });

  it("allows zero padding — '0' is a real token, not a falsy miss", () => {
    const { container } = render(<Box p="0" />);

    expect(classesOf(container)).toContain("astralis-p");
    expect(styleVarOf(container, "--astralis-p")).toBe("0");
  });
});

/*
 * The var-channel contract: one fixed class per prop per breakpoint, the value
 * in a custom property. These assertions pin the delivery mechanism itself —
 * the classes exist statically in channels.css, so a typo in either half
 * renders as nothing without failing anywhere else.
 */
describe("var-channel delivery", () => {
  it("resolves a scalar spacing token to class + token variable", () => {
    const { container } = render(<Box p="4" />);

    expect(classesOf(container)).toContain("astralis-p");
    expect(styleVarOf(container, "--astralis-p")).toBe("var(--astralis-spacing-4)");
  });

  it("carries the CSS-escaped ident for fractional steps", () => {
    // spacing.css declares --astralis-spacing-0\.5 — an unescaped reference
    // parses invalid and the declaration silently drops.
    const { container } = render(<Box p="0.5" />);

    expect(styleVarOf(container, "--astralis-p")).toBe("var(--astralis-spacing-0\\.5)");
  });

  it("emits one class and one variable per breakpoint entry", () => {
    const { container } = render(<Box p={{ base: "2", md: "8" }} />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis-p", "astralis-p-md"]),
    );
    expect(styleVarOf(container, "--astralis-p")).toBe("var(--astralis-spacing-2)");
    expect(styleVarOf(container, "--astralis-p-md")).toBe("var(--astralis-spacing-8)");
  });

  it("lets the caller's style win over channel variables", () => {
    const { container } = render(
      <Box p="4" style={{ "--astralis-p": "3rem" } as CSSProperties} />,
    );

    expect(styleVarOf(container, "--astralis-p")).toBe("3rem");
  });

  it("keeps a plain inline style intact alongside channel variables", () => {
    const { container } = render(<Box m="2" style={{ outline: "1px solid red" }} />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.getPropertyValue("--astralis-m")).toBe("var(--astralis-spacing-2)");
    expect(el.style.outline).toBe("1px solid red");
  });

  it("flows through Stack's axis translation to Flex", () => {
    const { container } = render(<Stack mt="4" />);

    expect(classesOf(container)).toContain("astralis-mt");
    expect(styleVarOf(container, "--astralis-mt")).toBe("var(--astralis-spacing-4)");
  });
});

/**
 * Interaction states are resolved by the same engine as responsive props, so
 * they share the same silent-failure mode: an unrecognised state prop becomes a
 * DOM attribute, and an unrecognised token inside one vanishes without a trace.
 */
describe("interaction-state props", () => {
  it("resolve to state channel classes + vars", () => {
    const { container } = render(
      <Box bg="base" hover={{ bg: "subtle" }} focusVisible={{ borderColor: "brand" }} />,
    );

    expect(classesOf(container)).toEqual(
      expect.arrayContaining([
        "astralis-bg",
        "astralis-hover-bg",
        "astralis-focus-visible-border-color",
      ]),
    );
    expect(styleVarOf(container, "--astralis-bg")).toBe("var(--astralis-color-surface-base)");
    expect(styleVarOf(container, "--astralis-bg-hover")).toBe(
      "var(--astralis-color-surface-subtle)",
    );
    expect(styleVarOf(container, "--astralis-border-color-focus-visible")).toBe(
      "var(--astralis-color-brand-stroke)",
    );
  });

  it("cover every channel prop, not just paint — the old limit is gone", () => {
    const { container } = render(<Box hover={{ p: "6", w: "full" }} />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis-hover-p", "astralis-hover-w"]),
    );
    expect(styleVarOf(container, "--astralis-p-hover")).toBe("var(--astralis-spacing-6)");
    expect(styleVarOf(container, "--astralis-w-hover")).toBe("var(--astralis-size-full)");
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

    expect(classesOf(container)).toContain("astralis-hover-bg");
    expect(styleVarOf(container, "--astralis-bg-hover")).toBe(
      "var(--astralis-color-surface-subtle)",
    );
  });

  it("leave `disabled` as a real HTML attribute", () => {
    // `disabled` is deliberately NOT a state prop: it collides with the native
    // attribute, and :disabled only matches form controls.
    const { container } = render(<Box as="button" disabled />);

    expect(container.firstElementChild!.hasAttribute("disabled")).toBe(true);
  });

  it("pass arbitrary values through, exactly like the base layer", () => {
    // States share the base props' vocabulary — including the pass-through,
    // so a state still cannot paint anything the base layer could not.
    const { container } = render(<Box hover={{ bg: "oklch(0.7 0.1 200)" }} />);

    expect(classesOf(container)).toContain("astralis-hover-bg");
    expect(styleVarOf(container, "--astralis-bg-hover")).toBe("oklch(0.7 0.1 200)");
  });
});

/*
 * The other half of the var-channel bargain: classes are finite, values are
 * not. A string that is no token rides the custom property untouched, so the
 * scale is a vocabulary rather than a ceiling. Only channel props do this —
 * keyword props are closed sets backed by build-time classes.
 */
describe("arbitrary-value pass-through", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delivers a non-token length straight into the channel var", () => {
    const { container } = render(<Box p="37px" />);

    expect(classesOf(container)).toContain("astralis-p");
    expect(styleVarOf(container, "--astralis-p")).toBe("37px");
  });

  it("carries calc() expressions", () => {
    const { container } = render(<Box w="calc(100vw - 200px)" />);

    expect(classesOf(container)).toContain("astralis-w");
    expect(styleVarOf(container, "--astralis-w")).toBe("calc(100vw - 200px)");
  });

  it("passes raw colors on the paint channels", () => {
    const { container } = render(<Box bg="#0ea5e9" borderColor="rebeccapurple" />);

    expect(styleVarOf(container, "--astralis-bg")).toBe("#0ea5e9");
    expect(styleVarOf(container, "--astralis-border-color")).toBe("rebeccapurple");
  });

  it("mixes tokens and raw values across breakpoints", () => {
    const { container } = render(<Box p={{ base: "5vw", md: "4" }} />);

    expect(classesOf(container)).toEqual(
      expect.arrayContaining(["astralis-p", "astralis-p-md"]),
    );
    expect(styleVarOf(container, "--astralis-p")).toBe("5vw");
    expect(styleVarOf(container, "--astralis-p-md")).toBe("var(--astralis-spacing-4)");
  });

  it("reaches placement props on recipe components", () => {
    const { container } = render(<Card w="37rem">content</Card>);
    const el = container.firstElementChild as HTMLElement;

    expect([...el.classList]).toContain("astralis-w");
    expect(el.style.getPropertyValue("--astralis-w")).toBe("37rem");
  });

  it("still prefers the token table when the value is a token", () => {
    const { container } = render(<Box p="4" />);

    expect(styleVarOf(container, "--astralis-p")).toBe("var(--astralis-spacing-4)");
  });

  it("resolves an empty string to nothing", () => {
    const { container } = render(<Box p="" />);

    expect(classesOf(container)).not.toContain("astralis-p");
    expect(styleVarOf(container, "--astralis-p")).toBe("");
  });

  it("warns in dev about a bare number on a length prop, but still delivers it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Box p="37" />);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('p="37"');
    expect(styleVarOf(container, "--astralis-p")).toBe("37");
  });

  it("does not warn where a bare number is valid CSS", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Box order="5" />);

    expect(warn).not.toHaveBeenCalled();
    expect(styleVarOf(container, "--astralis-order")).toBe("5");
  });

  it("keeps keyword props closed — an unknown display resolves to nothing", () => {
    const { container } = render(<Box display={"blorp" as never} />);
    const el = container.firstElementChild!;

    expect(classesOf(container).some((c) => c.includes("blorp"))).toBe(false);
    expect(el.hasAttribute("display")).toBe(false);
  });
});
