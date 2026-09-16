import { createElement as h, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { namesFromModule, toJsx } from "./jsx-source";

const Button = () => null;
const Title = () => null;
const Trigger = () => null;
const Modal = Object.assign(() => null, { Title, Trigger });
const Drawer = Object.assign(() => null, { Title });
const TabsList = () => null;
const Tabs = Object.assign(() => null, { List: TabsList });
const CodeRoot = () => null;
const CodeBlock = { Root: CodeRoot };

const nameOf = namesFromModule({
  Button,
  CodeBlock,
  Drawer,
  DrawerTitle: Title,
  Modal,
  ModalTitle: Title,
  Tabs,
  TabsList,
  helper: () => null,
});

describe("namesFromModule", () => {
  it("names a standalone export by its own name", () => {
    expect(nameOf(Button, [])).toBe("Button");
  });

  it("prefers the dotted form of a part over its flat alias", () => {
    expect(nameOf(TabsList, [])).toBe("Tabs.List");
  });

  it("names a shared part for the compound it sits in", () => {
    expect(nameOf(Title, ["Modal"])).toBe("Modal.Title");
    expect(nameOf(Title, ["Drawer"])).toBe("Drawer.Title");
  });

  it("reads parts off a namespace object as well as off a component", () => {
    expect(nameOf(CodeRoot, [])).toBe("CodeBlock.Root");
  });

  it("returns null for something the module doesn't export", () => {
    expect(nameOf(() => null, [])).toBeNull();
  });
});

describe("toJsx", () => {
  it("writes text children inline and element children indented", () => {
    const node = h(
      Fragment,
      null,
      h(Modal.Trigger, null, h(Button, { variant: "outline" }, "Open")),
      h(Modal.Title, null, "Edit profile"),
    );
    expect(toJsx(node, nameOf, "Modal")).toEqual({
      source: [
        "<Modal.Trigger>",
        '  <Button variant="outline">Open</Button>',
        "</Modal.Trigger>",
        "<Modal.Title>Edit profile</Modal.Title>",
      ].join("\n"),
      tags: ["Modal.Trigger", "Button", "Modal.Title"],
    });
  });

  it("keeps the space between an element and the text beside it", () => {
    const node = h(Button, null, h(Title, null, "12%"), " from last month");
    expect(toJsx(node, nameOf, "Modal").source).toBe(
      ["<Button>", "  <Modal.Title>12%</Modal.Title>", '  {" "}', "  from last month", "</Button>"].join(
        "\n",
      ),
    );
  });

  it("resolves shared parts against the root it is given", () => {
    expect(toJsx(h(Title, null, "Settings"), nameOf, "Drawer").source).toBe(
      "<Drawer.Title>Settings</Drawer.Title>",
    );
  });

  it("writes each kind of prop value the way JSX spells it", () => {
    const node = h(Button, {
      label: "Save",
      quoted: 'say "hi"',
      disabled: true,
      loading: false,
      count: 3,
      unset: undefined,
      items: [{ value: "a" }],
      icon: h(Button, null),
    });
    expect(toJsx(node, nameOf).source).toBe(
      '<Button label="Save" quoted={"say \\"hi\\""} disabled loading={false} count={3} items={[{ value: "a" }]} icon={<Button />} />',
    );
  });

  it("self-closes an element with no children and keeps intrinsic tags", () => {
    expect(toJsx(h("option", { value: "a" }), nameOf)).toEqual({
      source: '<option value="a" />',
      tags: [],
    });
  });

  it("escapes text JSX would otherwise parse", () => {
    expect(toJsx(h(Button, null, "a {b} <c>"), nameOf).source).toBe(
      '<Button>{"a {b} <c>"}</Button>',
    );
  });

  it("refuses a function prop and an unnamed component", () => {
    expect(() => toJsx(h(Button, { onClick: () => {} }), nameOf)).toThrow(/function/);
    expect(() => toJsx(h(() => null), nameOf)).toThrow(/no exported name/);
  });
});
