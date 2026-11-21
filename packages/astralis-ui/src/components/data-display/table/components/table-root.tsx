import { splitPlacement } from "../../../../utils/placement";
import type { TableProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const TableRoot = identify("Table", function TableRoot({
  children,
  variant = "line",
  size = "md",
  striped = false,
  interactive = false,
  stickyHeader = false,
  className = "",
  ...rest
}: TableProps) {
  const outer = variant === "outline"
    ? "astralis:border-normal astralis:border-stroke-base astralis:rounded-lg astralis:overflow-hidden"
    : "";

  const { placementClass, placementStyle, rest: domProps } = splitPlacement(rest);

  return (
    <div
      // The parts read these through CSS parent-keyed variants (see
      // table.styles.ts), which is what lets the whole compound stay a
      // Server Component. Booleans are presence-attributes: absent when off.
      data-table-size={size}
      data-table-striped={striped ? "" : undefined}
      data-table-interactive={interactive ? "" : undefined}
      data-table-sticky={stickyHeader ? "" : undefined}
      // A sideways scroller holds a view timeline still; the scope lets a
      // `reveal` inside the table follow the page instead (theme/motion.css).
      className={astralisMerge("astralis:w-full astralis:overflow-x-auto astralis:motion-reveal-scope", outer, placementClass, className)}
      style={placementStyle}
    >
      <table className="astralis:w-full astralis:border-collapse astralis:text-label-base" {...domProps}>
        {children}
      </table>
    </div>
  );
});
