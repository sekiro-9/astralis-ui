import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field, useFieldContext } from "./index";
import { Input } from "../input";

function LabelledByProbe() {
  const field = useFieldContext();
  return <span data-testid="probe">{field?.labelledBy ?? "none"}</span>;
}

describe("Field wiring", () => {
  it("labels the input and describes it with only the parts that are mounted", () => {
    const { rerender } = render(
      <Field id="email" required invalid>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.HelpText>Work address</Field.HelpText>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toHaveAttribute("id", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-help");

    rerender(
      <Field id="email" invalid>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.ErrorText>Required</Field.ErrorText>
      </Field>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "email-error");
  });

  it("publishes the mounted label's id for controls a <label for> cannot name", () => {
    const { rerender } = render(
      <Field id="f">
        <Field.Label>Name</Field.Label>
        <LabelledByProbe />
      </Field>,
    );
    expect(screen.getByText("Name").closest("label")).toHaveAttribute("id", "f-label");
    expect(screen.getByTestId("probe")).toHaveTextContent("f-label");

    rerender(
      <Field id="f">
        <Field.Label id="custom">Name</Field.Label>
        <LabelledByProbe />
      </Field>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("custom");

    rerender(
      <Field id="f">
        <LabelledByProbe />
      </Field>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("none");
  });
});
