import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "./index";
import { Field } from "../field";

describe("Checkbox", () => {
  it("applies indeterminate through a callback ref (react-hook-form register)", () => {
    let node: HTMLInputElement | null = null;
    render(
      <Checkbox
        ref={(el) => {
          node = el;
        }}
        indeterminate
      >
        All
      </Checkbox>,
    );
    expect(node).not.toBeNull();
    expect(node!.indeterminate).toBe(true);
  });

  it("puts className and style on the label, and ids, names and events on the input", () => {
    const onFocus = vi.fn();
    const { container } = render(
      <Checkbox className="outer" style={{ marginTop: 8 }} name="terms" data-testid="box" onFocus={onFocus}>
        Terms
      </Checkbox>,
    );
    const label = container.querySelector("label")!;
    const input = screen.getByRole("checkbox");
    expect(label).toHaveClass("outer");
    expect(label.style.marginTop).toBe("8px");
    expect(input.getAttribute("style")).toBeNull();
    expect(input).toHaveAttribute("name", "terms");
    expect(input).toHaveAttribute("data-testid", "box");
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
  });

  it("is uncontrolled by default and controlled when checked is given", () => {
    const { rerender } = render(<Checkbox>A</Checkbox>);
    const input = screen.getByRole("checkbox");
    fireEvent.click(input);
    expect(input).toBeChecked();
    rerender(
      <Checkbox checked={false} onChange={() => {}}>
        A
      </Checkbox>,
    );
    fireEvent.click(input);
    expect(input).not.toBeChecked();
  });

  it("stays unchecked when clicked read-only, in the DOM as well as in state", () => {
    const onChange = vi.fn();
    render(
      <Checkbox readOnly onChange={onChange}>
        Locked
      </Checkbox>,
    );
    const input = screen.getByRole("checkbox");
    fireEvent.click(input);
    expect(input).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("takes the Field id and required state when it stands alone", () => {
    render(
      <Field id="agree" required>
        <Field.Label>I agree</Field.Label>
        <Checkbox />
      </Field>,
    );
    const input = screen.getByRole("checkbox", { name: /I agree/ });
    expect(input).toHaveAttribute("id", "agree");
    expect(input).toBeRequired();
  });
});

describe("Checkbox.Group", () => {
  it("fires onValueChange and the deprecated onChange with the selection", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Checkbox.Group defaultValue={["a"]} onValueChange={onValueChange} onChange={onChange}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </Checkbox.Group>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"]);
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("is named by Field.Label and gives the Field id to no member", () => {
    render(
      <Field id="toppings">
        <Field.Label>Toppings</Field.Label>
        <Checkbox.Group>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </Checkbox.Group>
      </Field>,
    );
    expect(screen.getByRole("group", { name: "Toppings" })).toBeInTheDocument();
    for (const box of screen.getAllByRole("checkbox")) expect(box).not.toHaveAttribute("id");
  });
});
