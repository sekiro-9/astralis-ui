/* Zero-client compound: no context. The root stamps `data-empty-state-size`
   and the parts read it through parent-keyed attribute variants — the same
   technique Card uses. The md rung is the unprefixed default so a part outside
   a root still renders sensibly. */

export const emptyStateRoot =
  "astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:text-center " +
  "astralis:px-6 astralis:py-10 astralis:gap-1.5";

export const emptyStateIndicator = [
  "astralis:flex astralis:items-center astralis:justify-center astralis:rounded-full",
  "astralis:bg-surface-subtle astralis:text-label-subtle astralis:mb-2",
  "astralis:size-12 astralis:[&_svg]:size-6",
  "astralis:[[data-empty-state-size=sm]_&]:size-10 astralis:[[data-empty-state-size=sm]_&]:[&_svg]:size-5",
  "astralis:[[data-empty-state-size=lg]_&]:size-14 astralis:[[data-empty-state-size=lg]_&]:[&_svg]:size-7",
].join(" ");

export const emptyStateTitle = [
  "astralis:font-semibold astralis:text-label-base",
  "astralis:text-base",
  "astralis:[[data-empty-state-size=sm]_&]:text-sm",
  "astralis:[[data-empty-state-size=lg]_&]:text-lg",
].join(" ");

export const emptyStateDescription = [
  "astralis:text-label-muted astralis:max-w-sm",
  "astralis:text-sm",
  "astralis:[[data-empty-state-size=sm]_&]:text-xs",
  "astralis:[[data-empty-state-size=lg]_&]:text-base",
].join(" ");

export const emptyStateActions =
  "astralis:flex astralis:flex-wrap astralis:items-center astralis:justify-center astralis:gap-3 astralis:mt-4";
