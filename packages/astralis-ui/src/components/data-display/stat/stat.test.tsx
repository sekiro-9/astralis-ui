import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Stat, StatValue } from "./index";

/**
 * The size prop reaches the parts through context, which is the failure mode
 * worth testing: a part that stops reading the context still renders, still
 * typechecks, and quietly stays at `md` forever.
 */
describe("Stat size", () => {
  it("scales the value, label and help text together", () => {
    const { getByText } = render(
      <Stat size="xl">
        <Stat.Label>Revenue</Stat.Label>
        <Stat.Value>$48,200</Stat.Value>
        <Stat.HelpText>vs last quarter</Stat.HelpText>
      </Stat>,
    );

    expect(getByText("$48,200").className).toContain("astralis:text-5xl");
    expect(getByText("Revenue").className).toContain("astralis:text-base");
    expect(getByText("vs last quarter").className).toContain("astralis:text-base");
  });

  it("defaults to md", () => {
    const { getByText } = render(
      <Stat>
        <Stat.Value>12</Stat.Value>
      </Stat>,
    );

    expect(getByText("12").className).toContain("astralis:text-3xl");
  });

  it("moves the indicator onto the help-text rung", () => {
    const { getByText } = render(
      <Stat size="sm">
        <Stat.Indicator type="increase">4.2%</Stat.Indicator>
      </Stat>,
    );

    expect(getByText("4.2%").className).toContain("astralis:text-xs");
  });

  it("falls back to md for a part used outside a root", () => {
    // Parts are flat-exported, so this is legal — it must not throw.
    const { getByText } = render(<StatValue>7</StatValue>);

    expect(getByText("7").className).toContain("astralis:text-3xl");
  });

  it("accepts a breakpoint map, so a band can shrink on mobile", () => {
    const { getByText } = render(
      <Stat size={{ base: "lg", lg: "xl" }}>
        <Stat.Value>3</Stat.Value>
      </Stat>,
    );

    expect(getByText("3").className).toContain("astralis:text-4xl");
    expect(getByText("3").className).toContain("astralis:lg:text-5xl");
  });

  it("aligns the three lines together", () => {
    const { container } = render(
      <Stat align="center">
        <Stat.Value>3</Stat.Value>
      </Stat>,
    );

    expect(container.firstElementChild!.className).toContain("astralis:items-center");
  });

  it("lets a className still win, since size is a scale and not a lock", () => {
    const { getByText } = render(
      <Stat size="sm">
        <Stat.Value className="astralis:text-4xl">99</Stat.Value>
      </Stat>,
    );

    expect(getByText("99").className).toContain("astralis:text-4xl");
    expect(getByText("99").className).not.toContain("astralis:text-xl");
  });
});
