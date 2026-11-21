import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Text } from "./text";
import { Heading } from "./heading";
import { Link } from "./link";
import { Box } from "../layout/box";
import { Grid } from "../layout/grid";

const root = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe("Heading lineHeight=\"size\"", () => {
  it("drops Heading's tight line height, as undefined does", () => {
    const tight = root(<Heading>h</Heading>);
    const size = root(<Heading lineHeight="size">h</Heading>);
    const undef = root(<Heading lineHeight={undefined}>h</Heading>);
    expect(tight.className).toContain("astralis:leading-tight");
    expect(size.className).not.toMatch(/leading-/);
    expect(size.className).toBe(undef.className);
    expect(size.className).toContain("astralis:tracking-tight");
  });

  it("is a no-op on Text, which has no line height by default", () => {
    expect(root(<Text lineHeight="size">t</Text>).className).toBe(root(<Text>t</Text>).className);
  });

  it("a breakpoint map replaces Heading's tight line height", () => {
    const el = root(<Heading lineHeight={{ md: "loose" }}>h</Heading>);
    expect(el.className).toContain("astralis:md:leading-loose");
  });

  it("is not a breakpoint value", () => {
    // @ts-expect-error "size" cannot follow another line height
    root(<Heading lineHeight={{ base: "tight", md: "size" }}>h</Heading>);
  });
});

describe("textWrap, whiteSpace and numeric", () => {
  it.each([
    ["Text", (p: object) => <Text {...p}>t</Text>],
    ["Heading", (p: object) => <Heading {...p}>t</Heading>],
    ["Link", (p: object) => <Link href="#" {...p}>t</Link>],
  ])("%s resolves them to classes, not attributes", (_name, build) => {
    const el = root(build({ textWrap: "balance", whiteSpace: "pre-wrap", numeric: "tabular" }));
    expect(el).toHaveClass("astralis:text-balance", "astralis:whitespace-pre-wrap", "astralis:tabular-nums");
    for (const attr of ["textwrap", "whitespace", "numeric"]) expect(el.hasAttribute(attr)).toBe(false);
  });

  it("are responsive", () => {
    const el = root(<Text textWrap={{ base: "balance", lg: "nowrap" }} whiteSpace={{ "@md": "nowrap" }} numeric={{ sm: "tabular" }}>t</Text>);
    expect(el).toHaveClass(
      "astralis:text-balance",
      "astralis:lg:text-nowrap",
      "astralis:@min-[48rem]:whitespace-nowrap",
      "astralis:sm:tabular-nums",
    );
  });

  it("whiteSpace is a Box prop too, and reaches Box-composing primitives", () => {
    for (const el of [root(<Box whiteSpace="nowrap" />), root(<Grid whiteSpace={{ base: "normal", md: "nowrap" }} />)]) {
      expect(el.className).toMatch(/astralis:(md:)?whitespace-nowrap/);
      expect(el.hasAttribute("whitespace")).toBe(false);
    }
  });
});
