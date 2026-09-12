import { createRef, type ReactElement, type Ref } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Text } from "./text";
import { Heading } from "./heading";
import { List } from "./list";
import { Code } from "./code";
import { Blockquote } from "./blockquote";

/** A class token the engine can have generated CSS for: a prefixed utility
 *  (`astralis:…`) or a channel/scope class (`astralis-…`), nothing else. */
const VALID_TOKEN = /^astralis(:|-)[a-z0-9@:.\-/]+$/;

describe("default Text and Heading colour", () => {
  for (const [name, node] of [
    ["Text", <Text key="t">t</Text>],
    ["Heading", <Heading key="h">h</Heading>],
  ] as const) {
    it(`${name} emits only valid class tokens`, () => {
      const { container } = render(node);
      const classes = [...(container.firstElementChild as HTMLElement).classList];

      expect(classes.length).toBeGreaterThan(0);
      for (const cls of classes) expect(cls).toMatch(VALID_TOKEN);
    });

    it(`${name} sets no colour, so it inherits from its surface`, () => {
      const { container } = render(node);
      const root = container.firstElementChild as HTMLElement;

      expect(root.classList.contains("astralis-color")).toBe(false);
      expect(root.style.getPropertyValue("--astralis-color")).toBe("");
    });
  }

  it("an explicit base colour still applies through the channel", () => {
    const { container } = render(<Text color="base">t</Text>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.classList.contains("astralis-color")).toBe(true);
    expect(root.style.getPropertyValue("--astralis-color")).toBe("var(--astralis-color-label-base)");
    for (const cls of root.classList) expect(cls).toMatch(VALID_TOKEN);
  });
});

type Case = [string, (ref: Ref<HTMLElement>) => ReactElement];

const PRIMITIVES: Case[] = [
  ["Text", (ref) => <Text ref={ref as Ref<HTMLParagraphElement>}>t</Text>],
  ["Heading", (ref) => <Heading ref={ref as Ref<HTMLHeadingElement>}>h</Heading>],
  ["List", (ref) => <List ref={ref as Ref<HTMLUListElement>}><List.Item>i</List.Item></List>],
  ["List.Item", (ref) => <List.Item as="div" ref={ref as Ref<HTMLDivElement>}>i</List.Item>],
  ["Code", (ref) => <Code ref={ref}>c</Code>],
  ["Blockquote", (ref) => <Blockquote ref={ref as Ref<HTMLQuoteElement>}>q</Blockquote>],
];

describe.each(PRIMITIVES)("%s", (_name, build) => {
  it("attaches ref to its root element", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(build(ref));

    expect(ref.current).toBe(container.firstElementChild);
  });
});

describe("typography primitive behaviour kept through the migration", () => {
  it("Heading renders the requested level with heading defaults", () => {
    const { container } = render(<Heading as="h1">h</Heading>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.tagName).toBe("H1");
    expect([...root.classList]).toEqual(
      expect.arrayContaining(["astralis:text-4xl", "astralis:font-bold", "astralis:font-heading"]),
    );
  });

  it("List and Code keep their own variants apart from Box props", () => {
    const { container } = render(
      <List styleType="decimal" p="2">
        <List.Item>i</List.Item>
      </List>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue("--astralis-p")).toBe("var(--astralis-spacing-2)");
    expect(root.hasAttribute("styletype")).toBe(false);
  });
});
