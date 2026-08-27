export const fileUploadDropzone =
  "astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:gap-2 " +
  "astralis:rounded-lg astralis:border-normal astralis:border-dashed astralis:border-stroke-base " +
  "astralis:bg-surface-base astralis:px-6 astralis:py-8 astralis:text-center " +
  "astralis:transition-colors astralis:cursor-pointer " +
  "astralis:hover:border-stroke-muted astralis:hover:bg-surface-subtle " +
  "astralis:focus-visible:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring " +
  // Drag state is a data attribute so consumer styling can key on it too.
  "astralis:data-[dragging]:border-accent-solid astralis:data-[dragging]:bg-accent-subtle";

export const fileUploadDropzoneDisabled =
  "astralis:cursor-not-allowed astralis:opacity-moderate astralis:hover:border-stroke-base astralis:hover:bg-surface-base";

export const fileUploadItemGroup = "astralis:flex astralis:flex-col astralis:gap-2 astralis:mt-3";

export const fileUploadItem =
  "astralis:flex astralis:items-center astralis:gap-3 astralis:rounded-lg " +
  "astralis:border-normal astralis:border-stroke-base astralis:bg-surface-base astralis:px-3 astralis:py-2";

export const fileUploadItemIcon =
  "astralis:flex astralis:items-center astralis:justify-center astralis:size-8 astralis:shrink-0 " +
  "astralis:rounded-md astralis:bg-surface-subtle astralis:text-label-subtle astralis:[&_svg]:size-4";

export const fileUploadItemName = "astralis:text-sm astralis:text-label-base astralis:truncate";
export const fileUploadItemSize = "astralis:text-xs astralis:text-label-subtle";

export const fileUploadItemRemove =
  "astralis:ml-auto astralis:flex astralis:items-center astralis:justify-center astralis:size-6 astralis:shrink-0 " +
  "astralis:rounded-md astralis:text-label-subtle astralis:transition-colors " +
  "astralis:hover:bg-surface-subtle astralis:hover:text-label-base " +
  "astralis:focus-visible:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring astralis:[&_svg]:size-3.5";

/** 1023.4 KB → "1,023 KB"-style human size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}
