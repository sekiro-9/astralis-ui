import { act, createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { describeProps, identify, ignoredStyleProps, withIdentity } from "./dev-identity";
import { Badge, Box, Button, Card, Icon, Image, Input, Modal, Text, Textarea } from "../index";

const described = (element: Element | null) =>
  JSON.parse(element?.getAttribute("data-astralis-props") ?? "null") as Record<string, unknown>[];

describe("describeProps", () => {
  it("keeps configuration: tokens, flags, numbers and responsive or state maps", () => {
    expect(
      describeProps({
        variant: "outline",
        hoverable: true,
        columns: 3,
        p: { base: "2", md: "4", "@lg": "6" },
        hover: { bg: "brand-subtle" },
        as: "section",
      }),
    ).toEqual({
      variant: "outline",
      hoverable: true,
      columns: 3,
      p: { base: "2", md: "4", "@lg": "6" },
      hover: { bg: "brand-subtle" },
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

  it("drops objects that are neither a responsive map nor a state payload", () => {
    expect(
      describeProps({
        initial: { opacity: 0 },
        transition: { duration: 0.6 },
        variants: { shown: { opacity: 1 } },
        deep: { base: { b: "c" } },
        empty: { base: createElement("svg") },
        focusVisible: { borderColor: "brand", nested: { x: "y" } },
      }),
    ).toEqual({ focusVisible: { borderColor: "brand" } });
  });
});

/*
 * framer-motion's `initial`, `animate` and `transition` are plain objects. A
 * reduced-motion client renders `transition={{ duration: 0 }}` where the
 * server rendered 0.6, so recording them put a different attribute on each
 * side and React reported a hydration mismatch.
 */
describe("a component rendered through a motion component", () => {
  const MotionDiv = ({ initial: _i, animate: _a, transition: _t, ...rest }: Record<string, unknown>) =>
    createElement("div", rest);
  const place = (duration: number) =>
    createElement(Box as unknown as ComponentType<Record<string, unknown>>, {
      as: MotionDiv,
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration },
      p: "4",
    });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("hydrates without a mismatch when a foreign prop differs between server and client", async () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(place(0.6));
    document.body.append(host);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      hydrateRoot(host, place(0));
    });

    expect(errors.mock.calls.map((call) => String(call[0]))).toEqual([]);
    expect(described(host.firstElementChild)).toEqual([{ p: "4" }]);
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
      <Card variant="outline" m={{ base: "2", md: "4" }}>
        <Card.Body>body</Card.Body>
      </Card>,
    );
    const body = screen.getByText("body");
    expect(body.getAttribute("data-astralis")).toBe("Card.Body");
    const card = body.closest('[data-astralis="Card"]');
    expect(described(card)).toEqual([{ variant: "outline", m: { base: "2", md: "4" } }]);
  });

  it("names the parts an interactive overlay renders once it opens", async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <Button variant="subtle">Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Title>Layer</Modal.Title>
        </Modal.Content>
      </Modal>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("data-astralis")).toBe("Modal.Trigger Button");
    expect(described(trigger)).toEqual([{}, { variant: "subtle" }]);

    await user.click(trigger);
    await waitFor(() => expect(screen.getByText("Layer")).toBeInTheDocument());
    expect(screen.getByText("Layer").getAttribute("data-astralis")).toBe("Modal.Title");
    expect(screen.getByRole("dialog").closest("[data-astralis]")?.getAttribute("data-astralis")).toMatch(/^Modal\./);
  });
});

/*
 * The warned set lives for the whole module, as it does in an app, so each
 * test below uses a component and prop no other test passes.
 */
describe("a style prop the component does not take", () => {
  const warnings = () => vi.spyOn(console, "warn").mockImplementation(() => {});
  const told = (spy: ReturnType<typeof warnings>) =>
    spy.mock.calls.map((call) => String(call[0])).filter((text) => text.includes("does not take"));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("warns once per component and prop, in the validator's words, and still renders the attribute", () => {
    const spy = warnings();
    const { rerender, container } = render(<Card {...{ p: "4" }}>a</Card>);
    rerender(<Card {...{ p: "6" }}>a</Card>);
    render(<Card {...{ p: "4" }}>b</Card>);

    expect(told(spy)).toEqual([
      "[astralis-ui] Card does not take p: it reaches the HTML as a stray attribute and changes nothing (Card owns how it looks; reach for variant, size or colorScheme)",
    ]);
    expect(container.querySelector("[p]")).not.toBeNull();
  });

  it("points a layout prop at a Box around the component", () => {
    const spy = warnings();
    render(<Button {...{ display: "hidden" }}>Go</Button>);
    expect(told(spy)).toEqual([
      "[astralis-ui] Button does not take display: it reaches the HTML as a stray attribute and changes nothing (Button takes placement props; put display on a Box around it)",
    ]);
  });

  it("reports a long spelling and a component that takes no style props", () => {
    const spy = warnings();
    render(<Textarea {...({ padding: "4" } as Record<string, unknown>)} />);
    expect(told(spy)).toEqual([
      "[astralis-ui] Input.TextArea does not take padding: it reaches the HTML as a stray attribute and changes nothing (Input.TextArea takes no style props; put padding on a Box around it)",
    ]);
  });

  it("is silent for the props a component takes", () => {
    const spy = warnings();
    render(
      <>
        <Card w="full" m={{ base: "2", md: "4" }} marginTop="2" position="relative" variant="outline">a</Card>
        <Box p="4" bg="subtle" display="flex" hover={{ bg: "muted" }} />
        <Text color="muted" size="sm" {...({ p: undefined } as Record<string, unknown>)}>t</Text>
        <Button rounded="full" size="sm">b</Button>
        <Image src="/a.png" alt="" aspectRatio="square" rounded="md" />
      </>,
    );
    expect(told(spy)).toEqual([]);
  });

  it("is silent for HTML attributes that share a style prop's name", () => {
    const spy = warnings();
    render(
      <>
        <Image src="/a.png" alt="" width={200} height={100} />
        <Input size="sm" color="red" />
        <Textarea rows={4} wrap="soft" />
        <Icon display="block" opacity={0.5}>
          <svg />
        </Icon>
      </>,
    );
    expect(told(spy)).toEqual([]);
  });

  it("reports once, on the component the prop was written on, when it renders through another", () => {
    const spy = warnings();
    render(
      <Modal>
        <Modal.Trigger {...{ bg: "red" }}>
          <Button>Open</Button>
        </Modal.Trigger>
      </Modal>,
    );
    expect(told(spy)).toEqual([
      "[astralis-ui] Modal.Trigger does not take bg: it reaches the HTML as a stray attribute and changes nothing (Modal.Trigger takes no style props; put bg on a Box around it)",
    ]);
  });

  it("warns from a server render too", () => {
    const spy = warnings();
    renderToString(<Badge {...{ shadow: "lg" }}>new</Badge>);
    expect(told(spy)).toHaveLength(1);
    expect(told(spy)[0]).toMatch(/^\[astralis-ui\] Badge does not take shadow:/);
  });

  it("says nothing in production, where the component is not wrapped", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = warnings();
    const Plain = (props: Record<string, unknown>) => createElement("div", props);
    const Named = identify("Kbd", Plain);
    expect(Named).toBe(Plain);
    render(createElement(Named, { bg: "red", p: "4" }));
    expect(told(spy)).toEqual([]);
  });

  it("judges as the validator does: groups, own props and element attributes", () => {
    expect(ignoredStyleProps("Card", { p: "4", w: "full", gap: "2", color: "red", onClick: () => {} })).toEqual(["p", "gap"]);
    expect(ignoredStyleProps("Image", { rounded: "md", width: 10, bg: "red" })).toEqual(["bg"]);
    expect(ignoredStyleProps("Box", { p: "4", display: "flex" })).toEqual([]);
    expect(ignoredStyleProps("Menu.Item", { p: "4" })).toEqual([]);
  });
});
