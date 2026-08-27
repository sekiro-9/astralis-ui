/* The first-panel share travels as a CSS variable on the root; the panels
   are addressed positionally (first-of-type / last-of-type), so no
   registration protocol is needed — DOM order IS the API. */

export const splitterRoot =
  "astralis:flex astralis:w-full astralis:min-h-0 astralis:min-w-0 " +
  "astralis:[&>[data-astralis-splitter-panel]:first-of-type]:basis-[var(--astralis-splitter-size)] " +
  "astralis:[&>[data-astralis-splitter-panel]:first-of-type]:grow-0 " +
  "astralis:[&>[data-astralis-splitter-panel]:first-of-type]:shrink-0";

export const splitterRootVertical = "astralis:flex-col";

export const splitterPanel = "astralis:flex-1 astralis:min-w-0 astralis:min-h-0 astralis:overflow-auto";

/* The handle is a wide transparent hit area (group); the visible line is a
   real inner element — content-[''] pseudo-elements trip the coverage gate's
   quote parsing, and a child span needs no such workaround. */

export const splitterHandle =
  "astralis:group astralis:relative astralis:shrink-0 astralis:flex astralis:items-center astralis:justify-center " +
  "astralis:focus-visible:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring astralis:rounded-sm";

export const splitterHandleHorizontal = "astralis:w-2 astralis:cursor-col-resize";
export const splitterHandleVertical = "astralis:h-2 astralis:cursor-row-resize";

export const splitterHandleLine =
  "astralis:pointer-events-none astralis:bg-stroke-subtle astralis:transition-colors " +
  "astralis:group-hover:bg-accent-solid astralis:group-focus-visible:bg-accent-solid";

export const splitterHandleLineHorizontal = "astralis:w-px astralis:h-full";
export const splitterHandleLineVertical = "astralis:h-px astralis:w-full";

export const splitterHandleLineActive = "astralis:bg-accent-solid";
