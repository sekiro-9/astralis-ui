import type { TableSectionProps } from "../table.types";
import { tableStickyHeader } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableHeader = identify("Table.Header", function TableHeader({ children, className = "", ...props }: TableSectionProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <thead
      className={astralisMerge(
        "astralis:bg-surface-subtle astralis:border-b astralis:border-stroke-base",
        tableStickyHeader,
        placementClass,
        className,
      )}
      {...rest}
    >
      {children}
    </thead>
  );
});
