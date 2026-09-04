import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Radio } from "./index";
import { Field } from "../field";

describe("Radio", () => {
  it("puts className and style on the label, and name on the input", () => {
    const { container } = render(
      <Radio className="outer" style={{ marginTop: 8 }} name="plan" value="a">
        A
      </Radio>,
    );
    const label = container.querySelector("label")!;
    expect(label).toHaveClass("outer");
    expect(label.style.marginTop).toBe("8px");
    expect(screen.getByRole("radio")).toHaveAttribute("name", "plan");
    expect(screen.getByRole("radio").getAttribute("style")).toBeNull();
  });

  it("takes the Field id when it stands alone", () => {
    render(
      <Field id="solo">
        <Field.Label>Only option</Field.Label>
        <Radio value="x" />
      </Field>,
    );
    expect(screen.getByRole("radio", { name: "Only option" })).toHaveAttribute("id", "solo");
  });
});

describe("Radio.Group", () => {
  it("selects one value and reports it through onValueChange and onChange", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Radio.Group defaultValue="a" onValueChange={onValueChange} onChange={onChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
  });

  it("stays on the controlled value", () => {
    render(
      <Radio.Group value="a" onValueChange={() => {}}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });

  it("is named, described and marked required by its Field", () => {
    render(
      <Field id="plan" required invalid>
        <Field.Label>Plan</Field.Label>
        <Radio.Group>
          <Radio value="a">A</Radio>
        </Radio.Group>
        <Field.ErrorText>Pick one</Field.ErrorText>
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "plan-error");
    expect(screen.getByRole("radio")).not.toHaveAttribute("id");
  });
});
