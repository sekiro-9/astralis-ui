import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { NativeSelect } from "./index";
import { Field } from "../field";

describe("NativeSelect", () => {
  it("renders a real <select> with pass-through options", () => {
    const { container } = render(
      <NativeSelect aria-label="Fruit">
        <option value="apple">Apple</option>
        <option value="pear">Pear</option>
      </NativeSelect>,
    );
    const select = container.querySelector("select")!;
    expect(select.querySelectorAll("option")).toHaveLength(2);
    fireEvent.change(select, { target: { value: "pear" } });
    expect(select.value).toBe("pear");
  });

  it("renders the placeholder as a disabled empty option selected by default", () => {
    const { container } = render(
      <NativeSelect placeholder="Pick one" aria-label="Fruit">
        <option value="apple">Apple</option>
      </NativeSelect>,
    );
    const select = container.querySelector("select")!;
    const first = select.querySelector("option")!;
    expect(first.disabled).toBe(true);
    expect(first.value).toBe("");
    expect(select.value).toBe("");
  });
});

describe("NativeSelect chrome and Field", () => {
  it("keeps room for the chevron on every variant, including underline", () => {
    const { container } = render(
      <NativeSelect aria-label="Fruit" variant="underline" colorScheme="green">
        <option>Apple</option>
      </NativeSelect>,
    );
    const select = container.querySelector("select")!;
    expect(select.className).toMatch(/astralis:pr-9/);
    expect(select.className).toMatch(/astralis:border-b-2/);
    expect(container.firstElementChild).toHaveClass("astralis-accent-green");
  });

  it("takes the Field id, required and invalid state", () => {
    const { container } = render(
      <Field id="fruit" required invalid>
        <Field.Label>Fruit</Field.Label>
        <NativeSelect>
          <option>Apple</option>
        </NativeSelect>
      </Field>,
    );
    const select = container.querySelector("select")!;
    expect(select).toHaveAttribute("id", "fruit");
    expect(select).toBeRequired();
    expect(select).toHaveAttribute("aria-invalid", "true");
  });
});
