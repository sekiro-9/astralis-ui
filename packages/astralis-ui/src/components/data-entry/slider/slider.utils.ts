import type { SliderMark } from "./slider.types";

export function toPercent(value: number, min: number, max: number): number {
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function decimals(n: number): number {
  const s = String(n);
  const exp = s.indexOf("e-");
  if (exp !== -1) return Number(s.slice(exp + 2));
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Snap to the step grid anchored at `min`, rounded to the step's precision so
 *  0.1 + 0.2 lands on 0.3, not 0.30000000000000004. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const precision = Math.max(decimals(step), decimals(min));
  return clamp(Number(snapped.toFixed(precision)), min, max);
}

/** The value a key moves to, or null for keys the slider does not handle. */
export function valueForKey(key: string, value: number, min: number, max: number, step: number): number | null {
  const page = step * Math.max(1, Math.round((max - min) / 10 / step));
  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return snapToStep(value - step, min, max, step);
    case "ArrowRight":
    case "ArrowUp":
      return snapToStep(value + step, min, max, step);
    case "PageDown":
      return snapToStep(value - page, min, max, step);
    case "PageUp":
      return snapToStep(value + page, min, max, step);
    case "Home":
      return min;
    case "End":
      return max;
    default:
      return null;
  }
}

export function buildMarks(marks: boolean | SliderMark[] | undefined, min: number, max: number, step: number): SliderMark[] {
  if (!marks) return [];
  if (marks === true) {
    const count = Math.round((max - min) / step);
    if (count > 20) return [{ value: min }, { value: max }];
    return Array.from({ length: count + 1 }, (_, i) => ({ value: snapToStep(min + i * step, min, max, step) }));
  }
  return marks;
}
