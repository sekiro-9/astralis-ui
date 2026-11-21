import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Rating } from "./index";
import { Field } from "../field";

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

  it("draws empty stars as solid grey stars, in both modes, and red outlines when invalid", () => {
    const paint = (svg: Element) => [svg.getAttribute("fill"), [...svg.classList].find((c) => c.startsWith("astralis:text-"))];
    const empty = ["currentColor", "astralis:text-stroke-muted"];

    const readOnly = render(<Rating value={3} readOnly />).container;
    // Each star's first svg is its empty base; filled ones carry an overlay on top.
    const bases = [...readOnly.querySelectorAll('[role="img"] > span > svg')];
    expect(bases.map(paint)).toEqual(Array(5).fill(empty));

    const interactive = render(<Rating defaultValue={3} />).container;
    const stars = [...interactive.querySelectorAll("label svg")];
    expect(stars.slice(3).map(paint)).toEqual(Array(2).fill(empty));
    expect(paint(stars[0])).toEqual(["currentColor", "astralis:text-accent-solid"]);

    const invalid = render(<Rating defaultValue={3} invalid />).container;
    expect(paint([...invalid.querySelectorAll("label svg")][4])).toEqual(["none", "astralis:text-error-label"]);
  });
});

describe("Rating API and Field", () => {
  it("fires onValueChange and the deprecated onChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const { container } = render(<Rating onChange={onChange} onValueChange={onValueChange} />);
    fireEvent.click(container.querySelectorAll('input[type="radio"]')[2]);
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("reads disabled, invalid, required and its name from Field", () => {
    render(
      <Field disabled invalid required>
        <Field.Label>Quality</Field.Label>
        <Rating />
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Quality" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("takes placement props", () => {
    const { container } = render(<Rating mt="4" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList).toContain("astralis-mt");
    expect(root.hasAttribute("mt")).toBe(false);
  });
});
