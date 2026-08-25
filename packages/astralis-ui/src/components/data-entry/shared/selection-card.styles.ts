import type { CheckboxSize } from "../checkbox/checkbox.types";

/* Card-shaped selection chrome shared by CheckboxCard and RadioCard. The input
   itself is sr-only; the label wears the card and state is computed in React
   (like Switch), so the classes stay static literals. */

export const selectionCardSizes: Record<CheckboxSize, { card: string; title: string; description: string }> = {
  sm: { card: "astralis:p-3 astralis:gap-2", title: "astralis:text-xs", description: "astralis:text-xs" },
  md: { card: "astralis:p-4 astralis:gap-2.5", title: "astralis:text-sm", description: "astralis:text-xs" },
  lg: { card: "astralis:p-5 astralis:gap-3", title: "astralis:text-base", description: "astralis:text-sm" },
};

export const selectionCard =
  "astralis:relative astralis:flex astralis:items-start astralis:rounded-lg astralis:border-normal " +
  "astralis:transition-colors astralis:select-none " +
  "astralis:peer-focus-visible:ring-2 astralis:peer-focus-visible:ring-accent-ring astralis:peer-focus-visible:ring-offset-2 astralis:peer-focus-visible:ring-offset-surface-base";

/** Card chrome given its state. Checked paints from the accent channel. */
export function selectionCardColor(checked: boolean, invalid: boolean): string {
  if (invalid) {
    return "astralis:border-error-solid astralis:bg-surface-base";
  }
  return checked
    ? "astralis:border-accent-solid astralis:bg-accent-subtle"
    : "astralis:border-stroke-base astralis:bg-surface-base astralis:hover:border-stroke-muted";
}

/** The corner tick shown while checked (hidden otherwise to keep layout stable). */
export const selectionCardIndicator =
  "astralis:absolute astralis:top-3 astralis:right-3 astralis:flex astralis:items-center astralis:justify-center " +
  "astralis:size-4 astralis:rounded-full astralis:bg-accent-solid astralis:text-accent-contrast astralis:[&_svg]:size-3";

export const selectionCardTitle = "astralis:font-medium astralis:text-label-base";
export const selectionCardDescription = "astralis:text-label-muted astralis:mt-0.5";
