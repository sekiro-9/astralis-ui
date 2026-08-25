import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RadioCard } from "./index";
import { Radio } from "../radio";
import { CheckboxCard } from "../checkbox-card";
import { Checkbox } from "../checkbox";

describe("RadioCard", () => {
  it("joins Radio.Group exactly like Radio: value in, single-select out", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Radio.Group defaultValue="basic" onChange={onChange}>
        <RadioCard value="basic" description="For starters">Basic</RadioCard>
        <RadioCard value="pro" description="For teams">Pro</RadioCard>
      </Radio.Group>,
    );
    const radios = container.querySelectorAll('input[type="radio"]');
    expect((radios[0] as HTMLInputElement).checked).toBe(true);
    fireEvent.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith("pro");
  });

  it("shows the corner indicator only while checked", () => {
    const { container, rerender } = render(<RadioCard checked onChange={() => {}}>Plan</RadioCard>);
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<RadioCard checked={false} onChange={() => {}}>Plan</RadioCard>);
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("CheckboxCard", () => {
  it("joins Checkbox.Group: toggling accumulates values", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Checkbox.Group defaultValue={["a"]} onChange={onChange}>
        <CheckboxCard value="a">A</CheckboxCard>
        <CheckboxCard value="b">B</CheckboxCard>
      </Checkbox.Group>,
    );
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
    fireEvent.click(boxes[1]);
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });
});
