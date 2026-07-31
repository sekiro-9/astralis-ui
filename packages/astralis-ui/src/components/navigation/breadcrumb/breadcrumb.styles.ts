import { cva } from "class-variance-authority";

/**
 * Breadcrumb has no variants — it is one shape at one size — so these are plain
 * recipes rather than variant maps. They live here anyway so the trail's look is
 * editable in the same place as every other component's.
 */

/** The `nav` wrapper. Sets the type scale the whole trail inherits. */
export const breadcrumbVariants = cva("astralis:text-sm");

/** The `ol` holding the items and separators. Wraps on narrow viewports. */
export const breadcrumbListVariants = cva(
  "astralis:flex astralis:flex-wrap astralis:items-center astralis:gap-1.5",
);

/** The separator `li`. Decorative, so it is dimmed a rung below the links. */
export const breadcrumbSeparatorVariants = cva(
  "astralis:flex astralis:items-center astralis:text-label-subtle",
);

export const breadcrumbItemVariants = cva(
  "astralis:inline-flex astralis:items-center astralis:gap-1.5",
);

/** A navigable crumb: muted at rest, resolving to the base label on hover. */
export const breadcrumbLinkVariants = cva(
  "astralis:rounded-sm astralis:text-label-muted astralis:transition-colors astralis:hover:text-label-base " +
    "astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-brand-ring",
);

/** The current page: not a link, so it carries weight instead of affordance. */
export const breadcrumbCurrentVariants = cva(
  "astralis:font-medium astralis:text-label-base",
);

/** Size of the default chevron glyph. */
export const breadcrumbSeparatorIcon = "astralis:h-3.5 astralis:w-3.5";
