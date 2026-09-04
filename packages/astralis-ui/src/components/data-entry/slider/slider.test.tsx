import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Slider, RangeSlider } from "./index";
import { Field } from "../field";
import { snapToStep, valueForKey } from "./slider.utils";

/** jsdom has no layout: give the track a 0–100px box so clientX maps 1:1 to %. */
function layoutTrack(container: HTMLElement) {
  const track = container.querySelector<HTMLElement>('[style*="touch-action"]')!;
  track.getBoundingClientRect = () =>
    ({ left: 0, width: 100, top: 0, height: 4, right: 100, bottom: 4, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  return track;
}

describe("Slider keyboard", () => {
  it("moves by step, by page and to the ends", () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={50} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(51);
    fireEvent.keyDown(thumb, { key: "PageDown" });
    expect(onValueChange).toHaveBeenLastCalledWith(41);
    fireEvent.keyDown(thumb, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(thumb, { key: "Home" });
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
  });

  it("rounds fractional steps to the step's precision", () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Opacity" min={0} max={1} step={0.1} defaultValue={0.2} onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
  });

  it("keeps the deprecated onChange firing next to onValueChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={1} onChange={onChange} onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(2);
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("ignores keys while disabled or read-only", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Slider aria-label="x" disabled onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    rerender(<Slider aria-label="x" readOnly onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Slider pointer", () => {
  it("drags with a touch pointer, not only a mouse", () => {
    const onValueChange = vi.fn();
    const { container } = render(<Slider aria-label="x" defaultValue={0} onValueChange={onValueChange} />);
    const track = layoutTrack(container);

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: "touch", clientX: 30 });
    expect(onValueChange).toHaveBeenLastCalledWith(30);
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: "touch", clientX: 70 });
    expect(onValueChange).toHaveBeenLastCalledWith(70);
    fireEvent.pointerUp(track, { pointerId: 1, pointerType: "touch", clientX: 70 });
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: "touch", clientX: 90 });
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "70");
  });

  it("focuses the thumb on press and ignores a secondary mouse button", () => {
    const onValueChange = vi.fn();
    const { container } = render(<Slider aria-label="x" onValueChange={onValueChange} />);
    const track = layoutTrack(container);
    fireEvent.pointerDown(track, { pointerId: 1, pointerType: "mouse", button: 2, clientX: 40 });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(track, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 40 });
    expect(document.activeElement).toBe(screen.getByRole("slider"));
  });

  it("moves the nearer range thumb and never crosses its sibling", () => {
    const onValueChange = vi.fn();
    const { container } = render(<RangeSlider aria-label="Price" defaultValue={[20, 80]} onValueChange={onValueChange} />);
    const track = layoutTrack(container);

    fireEvent.pointerDown(track, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 70 });
    expect(onValueChange).toHaveBeenLastCalledWith([20, 70]);
    fireEvent.pointerMove(track, { pointerId: 1, pointerType: "mouse", clientX: 5 });
    expect(onValueChange).toHaveBeenLastCalledWith([20, 21]);
  });
});

describe("Slider accessibility and forms", () => {
  it("names the thumb from Field.Label and puts the Field id on the thumb", () => {
    render(
      <Field id="vol">
        <Field.Label>Volume</Field.Label>
        <Slider defaultValue={10} />
        <Field.HelpText>Loudness</Field.HelpText>
      </Field>,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("id", "vol");
    expect(thumb).toHaveAttribute("aria-describedby", "vol-help");
  });

  it("exposes aria-valuetext and submits through a hidden input", () => {
    const { container } = render(
      <Slider aria-label="Zoom" name="zoom" defaultValue={40} getAriaValueText={(v) => `${v}%`} />,
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "40%");
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"][name="zoom"]')!.value).toBe("40");
  });

  it("labels range thumbs individually and the pair as a group", () => {
    render(<RangeSlider aria-label="Price" thumbLabels={["Minimum", "Maximum"]} />);
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuemax", "80");
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuemin", "20");
  });

  it("takes placement props on both sliders", () => {
    const { container } = render(
      <>
        <Slider aria-label="a" mt="4" />
        <RangeSlider aria-label="b" mt="4" />
      </>,
    );
    for (const root of Array.from(container.children) as HTMLElement[]) {
      expect(root.hasAttribute("mt")).toBe(false);
      expect(root.classList).toContain("astralis-mt");
      expect(root.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-4)");
    }
  });
});

describe("slider maths", () => {
  it("snaps to the grid anchored at min, with the step's precision", () => {
    expect(snapToStep(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(4, 1, 10, 2)).toBe(5);
    expect(snapToStep(12, 0, 10, 3)).toBe(10);
  });

  it("returns null for keys it does not handle", () => {
    expect(valueForKey("a", 5, 0, 10, 1)).toBeNull();
  });
});
