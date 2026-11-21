import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import * as Astralis from "../index";
import { accentClass } from "./color-schemes";

const { Box, Flex, Stack, Badge, Button, ButtonGroup, Select, DatePicker, Calendar, CheckableTag } = Astralis;

/** Every root that takes `colorScheme`, with the props it cannot render without. */
const TAKES_COLOR_SCHEME: Record<string, Record<string, unknown>> = {
  Accordion: {}, Alert: {}, Avatar: { name: "Ada" }, Badge: {}, Button: {}, ButtonGroup: {},
  Calendar: {}, Carousel: {}, CheckableTag: { checked: true }, CheckableTagGroup: { options: [{ value: "a", label: "a" }], defaultValue: ["a"] },
  Checkbox: {}, CheckboxCard: {}, CheckboxGroup: {}, Combobox: {}, CopyButton: { value: "x" },
  DatePicker: {}, Editable: {}, FloatingButton: {}, Input: {}, InputPassword: {}, InputSearch: {},
  InputTextarea: {}, Link: { href: "#" }, Loader: {}, MultiSelect: {}, NativeSelect: {}, NumberInput: {},
  Pagination: { count: 30 }, PinInput: {}, Progress: { value: 50 }, Radio: {}, RadioCard: {}, RadioGroup: {},
  RangeSlider: {}, Rating: {}, SegmentedControl: {}, Select: {}, Slider: {}, Steps: {}, Switch: {},
  Tabs: { defaultValue: "a" }, Tag: {}, Textarea: {}, ThemeToggle: {}, Timeline: {},
};

/** Groups paint nothing themselves: their scheme shows on the item inside. */
const CHILD: Record<string, () => ReturnType<typeof createElement>> = {
  ButtonGroup: () => createElement(Astralis.Button, null, "b"),
  CheckboxGroup: () => createElement(Astralis.Checkbox, { value: "a" }),
  RadioGroup: () => createElement(Astralis.Radio, { value: "a" }),
};
const VOID = new Set(["Input", "InputPassword", "InputSearch", "NumberInput"]);

const html = (name: string, props: Record<string, unknown>) => {
  const Component = (Astralis as unknown as Record<string, ComponentType<Record<string, unknown>>>)[name];
  expect(Component, name).toBeTruthy();
  const children = VOID.has(name) ? [] : [CHILD[name]?.() ?? "x"];
  return renderToString(
    createElement(Astralis.AstralisProvider, null, createElement(Component, { ...TAKES_COLOR_SCHEME[name], ...props }, ...children)),
  );
};

describe('colorScheme="inherit"', () => {
  it("accentClass gives no class for inherit and the scope class for a hue", () => {
    expect(accentClass("inherit")).toBe("");
    expect(accentClass("red")).toBe("astralis-accent-red");
  });

  for (const name of Object.keys(TAKES_COLOR_SCHEME)) {
    it(`${name} applies no scheme of its own`, () => {
      expect(html(name, { colorScheme: "inherit" })).not.toMatch(/astralis-accent-/);
      expect(html(name, { colorScheme: "red" })).toContain("astralis-accent-red");
    });
  }

  it("each component keeps its own default when the prop is left off", () => {
    expect(html("Badge", {})).toContain("astralis-accent-gray");
    expect(html("Tag", {})).toContain("astralis-accent-gray");
    expect(html("Button", {})).toContain("astralis-accent-brand");
    expect(html("Rating", {})).toContain("astralis-accent-yellow");
    expect(html("Alert", {})).toContain("astralis-accent-info");
    expect(html("Input", {})).not.toMatch(/astralis-accent-/);
  });

  it("flows through ButtonGroup to its Buttons", () => {
    const { container } = render(
      <ButtonGroup colorScheme="inherit">
        <Button>a</Button>
        <Button>b</Button>
      </ButtonGroup>,
    );
    expect(container.innerHTML).not.toMatch(/astralis-accent-/);
  });

  it("an unchecked CheckableTag stays gray, a checked one inherits", () => {
    expect(render(<CheckableTag colorScheme="inherit">t</CheckableTag>).container.innerHTML).toContain("astralis-accent-gray");
    expect(render(<CheckableTag colorScheme="inherit" checked>t</CheckableTag>).container.innerHTML).not.toMatch(/astralis-accent-/);
  });
});

describe("colorScheme on a section", () => {
  it("Box, Flex and Stack put the scope class on their element", () => {
    for (const Host of [Box, Flex, Stack]) {
      const { container } = render(<Host colorScheme="red">x</Host>);
      const root = container.firstElementChild as HTMLElement;
      expect(root.classList.contains("astralis-accent-red")).toBe(true);
      expect(root.hasAttribute("colorscheme")).toBe(false);
    }
  });

  it("inherit on a Box sets no scope", () => {
    const { container } = render(<Box colorScheme="inherit">x</Box>);
    expect((container.firstElementChild as HTMLElement).className).toBe("");
  });

  it("a component inside takes the section's scope only when asked to", () => {
    const { container } = render(
      <Box colorScheme="red">
        <Badge colorScheme="inherit">in</Badge>
        <Badge>own</Badge>
      </Box>,
    );
    const [inherit, own] = container.querySelectorAll("span");
    expect(inherit.className).not.toMatch(/astralis-accent-/);
    expect(own.classList.contains("astralis-accent-gray")).toBe(true);
  });
});

describe("inherit reaches parts rendered in a portal", () => {
  const OPTIONS = [{ value: "a", label: "Apple" }];

  it("Select's list takes the scheme in scope at the trigger", () => {
    render(
      <Box colorScheme="red">
        <Box colorScheme="blue">
          <Select aria-label="Fruit" options={OPTIONS} colorScheme="inherit" />
        </Box>
      </Box>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox").closest(".astralis-accent-blue")).not.toBeNull();
  });

  it("with no scope above it, the list sets none (brand from the root)", () => {
    render(<Select aria-label="Fruit" options={OPTIONS} colorScheme="inherit" />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox").closest("[class*='astralis-accent-']")).toBeNull();
  });

  it("DatePicker hands the scheme in scope to its Calendar", () => {
    render(
      <Box colorScheme="red">
        <DatePicker colorScheme="inherit" defaultOpen />
      </Box>,
    );
    const grid = screen.getByRole("grid");
    expect(grid.closest(".astralis-accent-red")).not.toBeNull();
    expect(document.body.innerHTML).not.toContain("astralis-accent-brand");
  });

  it("an explicit hue still passes straight through", () => {
    render(<Calendar colorScheme="teal" />);
    expect(document.body.innerHTML).toContain("astralis-accent-teal");
  });
});
