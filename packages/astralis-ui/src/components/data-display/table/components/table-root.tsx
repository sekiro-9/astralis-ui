import { splitPlacement } from "../../../../utils/placement";
import type { TableProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TableRoot({
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
      className={astralisMerge("astralis:w-full astralis:overflow-x-auto", outer, placementClass, className)}
      style={placementStyle}
    >
      <table className="astralis:w-full astralis:border-collapse astralis:text-label-base" {...domProps}>
        {children}
      </table>
    </div>
  );
}
