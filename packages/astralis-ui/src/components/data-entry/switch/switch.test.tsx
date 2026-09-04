import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Switch } from "./index";
import { Field } from "../field";

describe("Switch", () => {
  it("toggles uncontrolled, and holds a controlled value", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch onChange={onChange}>Wi-Fi</Switch>);
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    fireEvent.click(control);
    expect(control).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(
      <Switch checked={false} onChange={onChange}>
        Wi-Fi
      </Switch>,
    );
    fireEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it("puts className and style on the label, not the sr-only input", () => {
    const { container } = render(<Switch className="outer" style={{ marginTop: 8 }} name="wifi" />);
    const label = container.querySelector("label")!;
    expect(label).toHaveClass("outer");
    expect(label.style.marginTop).toBe("8px");
    expect(screen.getByRole("switch")).toHaveAttribute("name", "wifi");
    expect(screen.getByRole("switch").getAttribute("style")).toBeNull();
  });

  it("ignores clicks while read-only and takes the Field id, required state and help text", () => {
    render(
      <Field id="alerts" required readOnly>
        <Field.Label>Alerts</Field.Label>
        <Switch />
        <Field.HelpText>Email only</Field.HelpText>
      </Field>,
    );
    const control = screen.getByRole("switch", { name: /Alerts/ });
    expect(control).toHaveAttribute("id", "alerts");
    expect(control).toBeRequired();
    expect(control).toHaveAttribute("aria-describedby", "alerts-help");
    fireEvent.click(control);
    expect(control).not.toBeChecked();
  });
});
