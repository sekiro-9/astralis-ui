import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { NativeSelect } from "./index";

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
