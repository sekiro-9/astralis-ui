import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Tabs } from "./index";

/**
 * A horizontal tab row that outgrows its container must scroll inside itself.
 * The failure mode is invisible in a unit test and obvious on a page: without
 * `min-w-0` a flex item refuses to shrink below its content, so the row widens
 * its parent and the whole PAGE scrolls sideways.
 *
 * jsdom reports every element as 0x0, so overflow detection (and therefore the
 * scroll buttons) cannot be exercised here — those are asserted by structure in
 * the browser. What is pinned down here is the containment contract.
 */
function ManyTabs({ orientation }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <Tabs defaultValue="a" orientation={orientation}>
      <Tabs.List aria-label="Sections" className="test-consumer-class">
        <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
        <Tabs.Trigger value="b">Bravo</Tabs.Trigger>
        <Tabs.Trigger value="c">Charlie</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">A</Tabs.Content>
      <Tabs.Content value="b">B</Tabs.Content>
      <Tabs.Content value="c">C</Tabs.Content>
    </Tabs>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tabs.List overflow containment", () => {
  it("makes a horizontal tablist scroll inside itself", () => {
    const { container } = render(<ManyTabs />);
    const list = container.querySelector('[role="tablist"]')!;

    expect([...list.classList]).toEqual(
      expect.arrayContaining([
        "astralis:overflow-x-auto",
        "astralis:scrollbar-none",
        "astralis:min-w-0",
      ]),
    );
  });

  it("caps the wrapper so the row can never widen the page", () => {
    const { container } = render(<ManyTabs />);
    const wrapper = container.querySelector('[role="tablist"]')!.parentElement!;

    expect([...wrapper.classList]).toEqual(
      expect.arrayContaining(["astralis:min-w-0", "astralis:max-w-full"]),
    );
  });

  it("keeps role=tablist on the scrolling element, not the wrapper", () => {
    const { container } = render(<ManyTabs />);
    const wrapper = container.querySelector('[role="tablist"]')!.parentElement!;

    expect(wrapper.getAttribute("role")).toBeNull();
    expect(container.querySelectorAll('[role="tablist"]')).toHaveLength(1);
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(3);
  });

  it("puts a consumer className on the wrapper so layout props still apply", () => {
    const { container } = render(<ManyTabs />);
    const wrapper = container.querySelector('[role="tablist"]')!.parentElement!;

    expect(wrapper.classList.contains("test-consumer-class")).toBe(true);
  });

  it("never scrolls an ancestor to bring the active tab into view", () => {
    // Regression: keeping the active tab visible was done with scrollIntoView,
    // which walks every scrollable ancestor up to the document. A tab set
    // sitting below the fold therefore dragged the whole page down to itself
    // on mount — the landing page jumped to its middle on every load.
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    const { rerender } = render(<ManyTabs />);

    rerender(<ManyTabs />);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("leaves the vertical list as a single element", () => {
    const { container } = render(<ManyTabs orientation="vertical" />);
    const list = container.querySelector('[role="tablist"]')!;

    // No scroll wrapper: a vertical rail grows downward, which the page scroll
    // already handles. The consumer class stays on the tablist itself.
    expect(list.classList.contains("test-consumer-class")).toBe(true);
    expect([...list.classList]).not.toContain("astralis:overflow-x-auto");
  });
});

/**
 * Uncontrolled tabs with no `defaultValue` used to show no panel at all: the
 * first trigger is the obvious choice, and a visual tool that assembles tabs
 * part by part has no moment at which to pick one.
 */
describe("Tabs with nothing chosen", () => {
  it("activates the first trigger and shows its panel", () => {
    const { getByRole, getByText } = render(
      <Tabs>
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
          <Tabs.Trigger value="b">Bravo</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    );
    expect(getByRole("tab", { name: "Alpha" }).getAttribute("aria-selected")).toBe("true");
    expect(getByText("Panel A")).toBeTruthy();
  });

  it("still honours defaultValue", () => {
    const { getByText } = render(
      <Tabs defaultValue="b">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
          <Tabs.Trigger value="b">Bravo</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    );
    expect(getByText("Panel B")).toBeTruthy();
  });
});

describe("Tabs accessible naming", () => {
  it.each(["horizontal", "vertical"] as const)("puts aria-label on the tablist (%s)", (orientation) => {
    const { getByRole } = render(<ManyTabs orientation={orientation} />);
    expect(getByRole("tablist").getAttribute("aria-label")).toBe("Sections");
  });

  it("leaves no naming attribute on the scroll wrapper", () => {
    const { getByRole } = render(<ManyTabs />);
    const wrapper = getByRole("tablist").parentElement!;

    expect(wrapper.hasAttribute("aria-label")).toBe(false);
  });
});

describe("Tabs ids from free-text values", () => {
  function Spaced() {
    return (
      <Tabs defaultValue="first tab">
        <Tabs.List aria-label="Spaced">
          <Tabs.Trigger value="first tab">One</Tabs.Trigger>
          <Tabs.Trigger value="first_tab">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="first tab">Panel one</Tabs.Content>
        <Tabs.Content value="first_tab">Panel two</Tabs.Content>
      </Tabs>
    );
  }

  it("wires trigger and panel through single-token ids", () => {
    const { getAllByRole, getByRole } = render(<Spaced />);
    const [first] = getAllByRole("tab");
    const panel = getByRole("tabpanel");

    expect(first.id).not.toMatch(/\s/);
    expect(first.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(first.id);
  });

  it("keeps values that differ only in punctuation apart", () => {
    const { getAllByRole } = render(<Spaced />);
    const [first, second] = getAllByRole("tab");

    expect(first.id).not.toBe(second.id);
  });
});
