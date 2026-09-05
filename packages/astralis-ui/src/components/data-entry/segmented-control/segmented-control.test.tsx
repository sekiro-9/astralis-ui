import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { SegmentedControl } from "./index";
import { Field } from "../field";

describe("SegmentedControl", () => {
  it("renders native radios sharing one name inside a radiogroup", () => {
    const { container } = render(
      <SegmentedControl defaultValue="list">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].getAttribute("name")).toBe(radios[1].getAttribute("name"));
    expect((radios[0] as HTMLInputElement).checked).toBe(true);
  });

  it("selects on change and reports the value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl defaultValue="list" onChange={onChange}>
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const grid = container.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement;
    fireEvent.click(grid);
    expect(onChange).toHaveBeenCalledWith("grid");
    expect(grid.checked).toBe(true);
  });

  it("honours the controlled value over clicks", () => {
    const { container } = render(
      <SegmentedControl value="grid">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const [list, grid] = [...container.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
    fireEvent.click(list);
    // Controlled: no state change without the parent updating `value`.
    expect(grid.checked).toBe(true);
  });
});

describe("SegmentedControl API", () => {
  const items = (
    <>
      <SegmentedControl.Item value="list">List</SegmentedControl.Item>
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
    </>
  );

  it("fires onValueChange and the deprecated onChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<SegmentedControl onChange={onChange} onValueChange={onValueChange}>{items}</SegmentedControl>);
    fireEvent.click(screen.getByRole("radio", { name: "Grid" }));
    expect(onValueChange).toHaveBeenCalledWith("grid");
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it("reads its name, disabled and invalid state from Field", () => {
    render(
      <Field disabled invalid>
        <Field.Label>View</Field.Label>
        <SegmentedControl>{items}</SegmentedControl>
      </Field>,
    );
    expect(screen.getByRole("radiogroup", { name: "View" })).toHaveAttribute("aria-invalid", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("takes placement props and a colorScheme that tints only the selected label", () => {
    const { container } = render(
      <SegmentedControl mt="4" colorScheme="green" defaultValue="list">
        {items}
      </SegmentedControl>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList).toContain("astralis-mt");
    expect(root).toHaveClass("astralis-accent-green");
    const [selected, other] = Array.from(container.querySelectorAll("label > span"));
    expect(selected.className).toMatch(/astralis:text-accent-label/);
    expect(other.className).not.toMatch(/astralis:text-accent-label/);
  });

  it("styles the segment with className and style, not the radio", () => {
    const { container } = render(
      <SegmentedControl>
        <SegmentedControl.Item value="a" className="seg" style={{ marginTop: 4 }}>A</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const label = container.querySelector("label")!;
    expect(label).toHaveClass("seg");
    expect(label.style.marginTop).toBe("4px");
    expect(screen.getByRole("radio").getAttribute("style")).toBeNull();
  });
});
