import type { EditableSize } from "./editable.types";

export const editableSizes: Record<EditableSize, string> = {
  sm: "astralis:text-sm",
  md: "astralis:text-base",
  lg: "astralis:text-lg",
};

/** Preview and input share metrics so entering edit mode does not shift layout. */
export const editablePreview =
  "astralis:inline-block astralis:rounded-md astralis:px-1.5 astralis:py-0.5 astralis:-mx-1.5 " +
  "astralis:cursor-text astralis:transition-colors astralis:hover:bg-surface-subtle " +
  "astralis:focus-visible:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring";

export const editablePreviewEmpty = "astralis:text-label-subtle";

export const editableInput =
  "astralis:inline-block astralis:w-full astralis:rounded-md astralis:px-1.5 astralis:py-0.5 astralis:-mx-1.5 " +
  "astralis:bg-surface-base astralis:text-label-base astralis:outline-none " +
  "astralis:ring-2 astralis:ring-accent-ring";
