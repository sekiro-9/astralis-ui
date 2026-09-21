import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { describeProps, identify, withIdentity } from "./dev-identity";
import { Button, Card, Modal } from "../index";

const described = (element: Element | null) =>
  JSON.parse(element?.getAttribute("data-astralis-props") ?? "null") as Record<string, unknown>[];

describe("describeProps", () => {
  it("keeps configuration: tokens, flags, numbers and responsive or state maps", () => {
    expect(
      describeProps({
        variant: "outline",
        hoverable: true,
        columns: 3,
        p: { base: "2", md: "4" },
        _hover: { bg: "brand.500" },
        as: "section",
      }),
    ).toEqual({
      variant: "outline",
      hoverable: true,
      columns: 3,
      p: { base: "2", md: "4" },
      _hover: { bg: "brand.500" },
      as: "section",
    });
  });

  it("drops content, handlers, DOM plumbing and anything that is not plain data", () => {
    expect(
      describeProps({
        children: "Hello",
        href: "/secret",
        src: "/me.png",
        alt: "me",
        value: "typed",
        name: "Paul",
        label: "Email",
        title: "Welcome",
        loadingText: "Saving",
        "aria-label": "Close",
        "data-testid": "x",
        className: "mine",
        style: { color: "red" },
        onClick: () => {},
        ref: { current: null },
        leftIcon: createElement("svg"),
        items: [1, 2],
        when: new Date(0),
        nan: Number.NaN,
        long: "x".repeat(65),
      }),
    ).toEqual({});
  });

  it("stops at two levels and drops maps with nothing left in them", () => {
    expect(
      describeProps({
        state: { _hover: { bg: "brand.500" } },
        deep: { a: { b: { c: "d" } } },
        empty: { icon: createElement("svg") },
      }),
    ).toEqual({ state: { _hover: { bg: "brand.500" } } });
  });
});

describe("withIdentity", () => {
  it("starts a chain", () => {
    const props = withIdentity("Card", { variant: "outline", children: "x" });
    expect(props["data-astralis"]).toBe("Card");
    expect(JSON.parse(props["data-astralis-props"] as string)).toEqual([{ variant: "outline" }]);
    expect(props.children).toBe("x");
  });

  it("adds to the chain when a component renders through another onto the same element", () => {
    const outer = withIdentity("Modal.Trigger", {});
    const inner = withIdentity("Button", { ...outer, variant: "ghost" });
    expect(inner["data-astralis"]).toBe("Modal.Trigger Button");
    expect(JSON.parse(inner["data-astralis-props"] as string)).toEqual([{}, { variant: "ghost" }]);
  });

  it("keeps the names when the props attribute is missing or not its own", () => {
    const props = withIdentity("Button", { "data-astralis": "A B", "data-astralis-props": "{nope" });
    expect(props["data-astralis"]).toBe("A B Button");
    expect(JSON.parse(props["data-astralis-props"] as string)).toEqual([{}, {}, {}]);
  });
});

describe("identify", () => {
  it("names the component and puts the identity on the element it renders", () => {
    const Plain = identify("Plain", (props: Record<string, unknown>) => createElement("p", props, "hi"));
    expect(Plain.displayName).toBe("Plain");
    render(createElement(Plain, { size: "sm" }));
    const p = screen.getByText("hi");
    expect(p.getAttribute("data-astralis")).toBe("Plain");
    expect(described(p)).toEqual([{ size: "sm" }]);
  });

  it("names a Server Component with the props it was configured with", () => {
    render(
      <Card variant="outline" p={{ base: "2", md: "4" }}>
        <Card.Body>body</Card.Body>
      </Card>,
    );
    const body = screen.getByText("body");
    expect(body.getAttribute("data-astralis")).toBe("Card.Body");
    const card = body.closest('[data-astralis="Card"]');
    expect(described(card)).toEqual([{ variant: "outline", p: { base: "2", md: "4" } }]);
  });

  it("names the parts an interactive overlay renders once it opens", async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <Button variant="ghost">Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Title>Layer</Modal.Title>
        </Modal.Content>
      </Modal>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("data-astralis")).toBe("Modal.Trigger Button");
    expect(described(trigger)).toEqual([{}, { variant: "ghost" }]);

    await user.click(trigger);
    await waitFor(() => expect(screen.getByText("Layer")).toBeInTheDocument());
    expect(screen.getByText("Layer").getAttribute("data-astralis")).toBe("Modal.Title");
    expect(screen.getByRole("dialog").closest("[data-astralis]")?.getAttribute("data-astralis")).toMatch(/^Modal\./);
  });
});
