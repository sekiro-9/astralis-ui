import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CardRoot } from "./data-display/card";
import { StatRoot, StatLabel, StatValue } from "./data-display/stat";
import { Select } from "./data-entry/select";

/**
 * The rule these pin down:
 *
 *   A component owns how it LOOKS. Its parent owns WHERE IT SITS and HOW BIG.
 *
 * Recipe components take the placement set (size, flex-item, margin) and none
 * of Box's paint props. Before this, sizing a Card cost a wrapper node purely
 * to reach one prop, which is why no block used Card at all.
 *
 * The failure mode being guarded is the one this library keeps producing: a
 * prop that looks valid and does nothing — or worse, reaches the DOM as a
 * stray attribute.
 */

describe("placement props on recipe components", () => {
  it("resolves placement props to classes on Card", () => {
    const { container } = render(
      <CardRoot w="full" maxW="lg" flex="1" mt="4">
        card
      </CardRoot>,
    );
    const card = container.firstElementChild!;

    expect([...card.classList]).toEqual(
      expect.arrayContaining([
        "astralis:w-full",
        "astralis:max-w-lg",
        "astralis:flex-1",
        "astralis:mt-4",
      ]),
    );
  });

  it("never leaks a placement prop onto the DOM as an attribute", () => {
    const { container } = render(<CardRoot w="full" alignSelf="end" mb="2" />);
    const card = container.firstElementChild!;

    for (const leaked of ["w", "alignself", "mb"]) {
      expect(card.hasAttribute(leaked)).toBe(false);
    }
  });

  it("keeps the recipe's own variant classes alongside placement", () => {
    const { container } = render(<CardRoot variant="outline" size="lg" w="full" />);
    const classes = [...container.firstElementChild!.classList];

    // `size` here is the Card recipe's scale, not Box's width+height.
    expect(classes).toEqual(expect.arrayContaining(["astralis:w-full"]));
    expect(classes.some((c) => c.includes("border"))).toBe(true);
  });

  it("accepts responsive placement, the same as on Box", () => {
    const { container } = render(<CardRoot w={{ base: "full", md: "1/2" }} />);
    const classes = [...container.firstElementChild!.classList];

    // Whole class names, not prefixes: the CSS coverage gate scans source for
    // `astralis:` strings, so a partial one reads as a class that must exist.
    expect(classes).toEqual(
      expect.arrayContaining(["astralis:w-full", "astralis:md:w-1/2"]),
    );
  });

  it("gives Stat placement and a flat root export", () => {
    const { container } = render(
      <StatRoot w="full" mt="2">
        <StatLabel>Revenue</StatLabel>
        <StatValue>$12k</StatValue>
      </StatRoot>,
    );
    const stat = container.firstElementChild!;

    expect([...stat.classList]).toEqual(
      expect.arrayContaining(["astralis:w-full", "astralis:mt-2"]),
    );
    expect(stat.hasAttribute("w")).toBe(false);
  });

  it("passes an aria-label through to Select's combobox", () => {
    // Select destructured every prop with no rest, so a label passed from
    // outside was dropped and a Field wrapper was the only way to name one.
    const { container } = render(<Select aria-label="Pick a plan" options={[]} w="full" />);

    const combobox = container.querySelector('[role="combobox"]')!;
    expect(combobox.getAttribute("aria-label")).toBe("Pick a plan");

    // Placement belongs to the wrapper, not the trigger.
    expect([...container.firstElementChild!.classList]).toContain("astralis:w-full");
  });
});
