import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Combobox } from "./combobox";
import { DatePicker } from "./date-picker";
import { MultiSelect } from "./multi-select";
import { NativeSelect } from "./native-select";
import { NumberInput } from "./number-input";
import { PinInput } from "./pin-input";
import { Select } from "./select";
import { Textarea } from "./input";

/**
 * `rounded` across the controls that wear Input's chrome. Each row renders the
 * control and returns the elements that carry the chrome (PinInput: every cell).
 */
type Row = [string, (props: Record<string, unknown>) => HTMLElement[], { multiline?: boolean; noFull?: boolean }];
const first = (c: HTMLElement, selector: string) => [c.querySelector(selector) as HTMLElement];

const ROWS: Row[] = [
  ["Combobox", (p) => first(render(<Combobox aria-label="c" options={[]} {...p} />).container, "input"), {}],
  ["DatePicker", (p) => first(render(<DatePicker aria-label="d" {...p} />).container, "button"), {}],
  ["NumberInput", (p) => first(render(<NumberInput aria-label="n" {...p} />).container, "input"), {}],
  ["Select", (p) => first(render(<Select aria-label="s" options={[]} {...p} />).container, "button"), {}],
  ["NativeSelect", (p) => first(render(<NativeSelect aria-label="n" {...p}><option>a</option></NativeSelect>).container, "select"), {}],
  ["PinInput", (p) => [...render(<PinInput length={3} {...p} />).container.querySelectorAll("input")] as HTMLElement[], {}],
  ["MultiSelect", (p) => first(render(<MultiSelect aria-label="m" options={[]} {...p} />).container, ".astralis\\:cursor-text"), { multiline: true }],
  ["Textarea", (p) => first(render(<Textarea aria-label="t" {...p} />).container, "textarea"), { noFull: true }],
];

const radii = (el: Element) => [...el.classList].filter((c) => /^astralis:rounded(-[a-z0-9]+)?$/.test(c));

describe.each(ROWS)("rounded on %s", (_name, chrome, { multiline, noFull }) => {
  it("keeps each variant's own corners when unset", () => {
    for (const el of chrome({})) expect(radii(el)).toEqual(["astralis:rounded-lg"]);
    for (const el of chrome({ variant: "filled" })) expect(radii(el)).toEqual(["astralis:rounded-lg"]);
    for (const el of chrome({ variant: "underline" })) expect(radii(el)).toEqual(["astralis:rounded-none"]);
  });

  it("replaces the variant's radius with the one asked for", () => {
    for (const el of chrome({ rounded: "none" })) expect(radii(el)).toEqual(["astralis:rounded-none"]);
    for (const el of chrome({ rounded: "xl" })) expect(radii(el)).toEqual(["astralis:rounded-xl"]);
    if (noFull) return;
    // A field that wraps to more rows takes `3xl` for `full`: a pill at one row, sane at three.
    const full = multiline ? "astralis:rounded-3xl" : "astralis:rounded-full";
    for (const el of chrome({ rounded: "full" })) expect(radii(el)).toEqual([full]);
  });
});

describe("NumberInput's stepper follows the corners", () => {
  const stepper = (props: Record<string, unknown>) =>
    render(<NumberInput aria-label="n" {...props} />).container.querySelector('[aria-hidden="true"]') as HTMLElement;

  it("keeps today's shape when unset", () => {
    expect(radii(stepper({}))).toEqual(["astralis:rounded-md"]);
    expect(stepper({}).classList).toContain("astralis:right-1");
  });

  it("becomes a capsule set further in on a pill, and square on a square field", () => {
    const pill = stepper({ rounded: "full" });
    expect(radii(pill)).toEqual(["astralis:rounded-full"]);
    expect(pill.classList).toContain("astralis:right-1.5");
    expect(radii(stepper({ rounded: "none" }))).toEqual(["astralis:rounded-none"]);
  });
});
