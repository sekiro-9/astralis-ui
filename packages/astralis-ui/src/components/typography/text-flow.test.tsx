import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Text } from "./text";
import { Heading } from "./heading";

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
