import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Rating } from "./index";

describe("Rating", () => {
  it("renders max radios in a labelled radiogroup and selects whole stars", () => {
    const onChange = vi.fn();
    const { container } = render(<Rating max={5} defaultValue={2} onChange={onChange} />);
    const group = container.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute("aria-label")).toBe("Rating");
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(5);
    expect((radios[1] as HTMLInputElement).checked).toBe(true);
    fireEvent.click(radios[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("readOnly renders a static img role with half-star fills from fractional values", () => {
    const { container } = render(<Rating value={3.5} readOnly />);
    const img = container.querySelector('[role="img"]')!;
    expect(img.getAttribute("aria-label")).toBe("3.5 out of 5 stars");
    expect(container.querySelector('input[type="radio"]')).toBeNull();
    // The 4th star's overlay is clipped to 50% via inline width (fraction
    // utilities don't emit from dynamic values).
    const overlays = [...container.querySelectorAll("span")].filter((s) => s.style.width);
    expect(overlays.map((s) => s.style.width)).toContain("50%");
  });
});
