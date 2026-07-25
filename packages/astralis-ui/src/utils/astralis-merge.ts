import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  prefix: "astralis",
  extend: {
    classGroups: {
      // Tell tailwind-merge that 'border-<val>' are valid border widths for these custom keys
      "border-w": [{ border: ["normal", "moderate", "thick", "thicker", "thickest"] }],
      // Tell tailwind-merge that 'border-<val>' are valid colors for these custom keys.
      // Only the neutral stroke ladder lives here — a status border is a palette
      // role (`border-error-stroke`), which tailwind-merge already parses.
      "border-color": [{
        border: ["stroke-base", "stroke-muted", "stroke-subtle", "stroke-inverted"]
      }]
    }
  }
});

export function astralisMerge(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}