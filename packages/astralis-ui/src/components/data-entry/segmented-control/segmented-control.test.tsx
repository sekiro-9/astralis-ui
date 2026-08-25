import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { SegmentedControl } from "./index";

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
