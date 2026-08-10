import { splitPlacement } from "../../../../utils/placement";
import type { TableProps } from "../table.types";
import { TableContext } from "../table.context";
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

  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <TableContext.Provider value={{ size, variant, striped, interactive, stickyHeader }}>
      <div className={astralisMerge("astralis:w-full astralis:overflow-x-auto", outer, placementClass, className)}>
        <table className="astralis:w-full astralis:border-collapse astralis:text-label-base" {...domProps}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}
