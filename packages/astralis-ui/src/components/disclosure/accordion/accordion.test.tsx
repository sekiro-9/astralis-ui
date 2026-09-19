import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Accordion } from "./index";
import type { AccordionProps } from "./accordion.types";

function Fixture(props: Partial<AccordionProps>) {
  return (
    <Accordion {...props}>
      <Accordion.Item value="first item">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>One</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'second "quoted"'}>
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Two</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="third" disabled>
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Content>Three</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("wires trigger and region by ids that survive spaces and quotes in values", () => {
    render(<Fixture defaultValue="first item" />);
    const trigger = screen.getByRole("button", { name: "First" });
    const controls = trigger.getAttribute("aria-controls")!;
    expect(controls).not.toMatch(/\s/);
    const region = document.getElementById(controls)!;
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-labelledby", trigger.id);
    expect(screen.getByRole("region", { name: "First" })).toBe(region);
  });

  it("opens one item at a time in single mode and reports the value", () => {
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onValueChange).toHaveBeenLastCalledWith('second "quoted"');
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the open item only when collapsible", () => {
    const { rerender } = render(<Fixture defaultValue="first item" />);
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    rerender(<Fixture key="c" defaultValue="first item" collapsible />);
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps several open in multiple mode", () => {
    render(<Fixture type="multiple" />);
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
  });

  it("moves focus between enabled triggers with the arrow keys, Home and End", () => {
    render(<Fixture />);
    const first = screen.getByRole("button", { name: "First" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Second" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Second" }));
  });

  it("honours a controlled value", () => {
    render(<Fixture value="first item" onValueChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
  });
});
