import type { PopoutAlign, PopoutSide } from "./popout.types";

export const popoutTriggerClasses =
  "astralis:inline-flex astralis:items-center astralis:gap-2 astralis:cursor-pointer astralis:rounded-md astralis:border astralis:border-stroke-base astralis:bg-surface-base astralis:px-3 astralis:py-2 astralis:text-sm astralis:font-medium astralis:text-label-base astralis:outline-none astralis:hover:bg-surface-subtle astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring";

/* Top-layer panel. `inset-auto` clears the UA popover centering so CSS
   anchor positioning (position-area) takes over. */
export const popoutContentClasses =
  "astralis:m-0 astralis:inset-auto astralis:w-max astralis:max-w-xs astralis:rounded-lg astralis:border astralis:border-stroke-base astralis:bg-surface-raised astralis:p-4 astralis:text-sm astralis:text-label-base astralis:shadow-lg";

/** side/align -> position-area. Two keywords: block axis, then inline span. */
export function positionArea(side: PopoutSide, align: PopoutAlign): string {
  if (side === "top" || side === "bottom") {
    const block = side === "top" ? "block-start" : "block-end";
    const inline =
      align === "center" ? "" : align === "start" ? "span-inline-end" : "span-inline-start";
    return inline ? `${block} ${inline}` : block;
  }
  const inline = side === "left" ? "inline-start" : "inline-end";
  const block =
    align === "center" ? "" : align === "start" ? "span-block-end" : "span-block-start";
  return block ? `${inline} ${block}` : inline;
}

export function positionFallbacks(side: PopoutSide): string {
  return side === "top" || side === "bottom" ? "flip-block, flip-inline" : "flip-inline, flip-block";
}
