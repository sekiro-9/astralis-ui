import { createRef, type ReactElement, type Ref } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Box } from "./box";
import { Flex } from "./flex";
import { Grid } from "./grid";
import { Stack, HStack, VStack } from "./stack";
import { Center } from "./center";
import { Container } from "./container";
import { Float } from "./float";
import { Separator } from "./separator";
import { AspectRatio } from "./aspect-ratio";

type Case = [string, (ref: Ref<HTMLDivElement>) => ReactElement];

/** Every primitive takes ref as a plain prop now; a dropped ref is silent. */
const PRIMITIVES: Case[] = [
  ["Box", (ref) => <Box ref={ref} p="4" data-x="1" />],
  ["Flex", (ref) => <Flex ref={ref} p="4" gap="2" data-x="1" />],
  ["Flex.Item", (ref) => <Flex.Item ref={ref} p="4" grow="1" data-x="1" />],
  ["Grid", (ref) => <Grid ref={ref} p="4" columns="2" data-x="1" />],
  ["Grid.Item", (ref) => <Grid.Item ref={ref} p="4" colSpan="2" data-x="1" />],
  ["Stack", (ref) => <Stack ref={ref} p="4" data-x="1" />],
  ["HStack", (ref) => <HStack ref={ref} p="4" data-x="1" />],
  ["VStack", (ref) => <VStack ref={ref} p="4" data-x="1" />],
  ["Center", (ref) => <Center ref={ref} p="4" data-x="1" />],
  ["Container", (ref) => <Container ref={ref} p="4" data-x="1" />],
  ["Float", (ref) => <Float ref={ref} p="4" data-x="1" />],
  ["Separator", (ref) => <Separator ref={ref} p="4" data-x="1" />],
  ["AspectRatio", (ref) => <AspectRatio ref={ref} p="4" data-x="1" />],
];

describe.each(PRIMITIVES)("%s", (_name, build) => {
  it("attaches ref to its root element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(build(ref));

    expect(ref.current).toBe(container.firstElementChild);
  });

  it("resolves Box style props and forwards only DOM props", () => {
    const { container } = render(build(createRef()));
    const root = container.firstElementChild as HTMLElement;

    expect(root.classList.contains("astralis-p")).toBe(true);
    expect(root.style.getPropertyValue("--astralis-p")).toBe("var(--astralis-spacing-4)");
    expect(root.getAttribute("data-x")).toBe("1");
    for (const leaked of ["p", "gap", "grow", "columns", "colspan"]) {
      expect(root.hasAttribute(leaked)).toBe(false);
    }
  });
});

describe("layout primitive behaviour kept through the migration", () => {
  it("renders the element named by `as`", () => {
    const { container } = render(<Box as="section" />);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });

  it("Stack translates a responsive direction key by key", () => {
    const { container } = render(<Stack direction={{ base: "vertical", md: "horizontal" }} />);
    const classes = [...(container.firstElementChild as HTMLElement).classList];

    expect(classes).toEqual(expect.arrayContaining(["astralis:flex-col", "astralis:md:flex-row"]));
  });

  it("HStack's direction cannot be overridden by a spread prop", () => {
    const props = { direction: "vertical" } as object;
    const { container } = render(<HStack {...props} />);
    const classes = [...(container.firstElementChild as HTMLElement).classList];

    expect(classes).toContain("astralis:flex-row");
    expect(classes).not.toContain("astralis:flex-col");
  });

  it("Container's defaults yield to an explicit Box prop", () => {
    const { container } = render(<Container maxW="lg" mx="4" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue("--astralis-max-w")).toBe("var(--astralis-size-lg)");
    expect(root.style.getPropertyValue("--astralis-mx")).toBe("var(--astralis-spacing-4)");
  });

  it("Separator reports a scalar orientation and omits a responsive one", () => {
    const { container, rerender } = render(<Separator orientation="vertical" />);
    expect(container.firstElementChild?.getAttribute("aria-orientation")).toBe("vertical");

    rerender(<Separator orientation={{ base: "horizontal", md: "vertical" }} />);
    expect(container.firstElementChild?.hasAttribute("aria-orientation")).toBe(false);
  });

  it("the caller's style wins over channel vars", () => {
    const { container } = render(<Flex gap="2" style={{ ["--astralis-gap" as string]: "1px" }} />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--astralis-gap")).toBe("1px");
  });
});
