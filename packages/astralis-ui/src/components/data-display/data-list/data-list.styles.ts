/*
 * DataList styling travels by CSS instead of context: the root <dl> stamps
 * `data-datalist-size` and `data-datalist-orientation`, and the parts carry
 * parent-keyed variants on them, keeping the whole compound a Server
 * Component. The md / horizontal styles are the unprefixed defaults — a part
 * outside a root renders md-horizontal quietly (the context threw; see the
 * 0.7.2 changelog).
 */

/** Label/value text size. md default, sm/lg keyed off the root. */
export const dataListTextSize = [
  "astralis:text-sm",
  "astralis:[[data-datalist-size=sm]_&]:text-xs",
  "astralis:[[data-datalist-size=lg]_&]:text-base",
].join(" ");

/** Item layout: horizontal row default, vertical stack when the root says so. */
export const dataListItemLayout = [
  "astralis:flex astralis:gap-4",
  "astralis:[[data-datalist-orientation=vertical]_&]:flex-col astralis:[[data-datalist-orientation=vertical]_&]:gap-0.5",
].join(" ");

/** The label's fixed column only exists in the horizontal layout. */
export const dataListLabelLayout =
  "astralis:w-40 astralis:shrink-0 astralis:[[data-datalist-orientation=vertical]_&]:w-auto astralis:[[data-datalist-orientation=vertical]_&]:shrink";
