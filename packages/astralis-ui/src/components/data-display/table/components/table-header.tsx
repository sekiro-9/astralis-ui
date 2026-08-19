import type { TableSectionProps } from "../table.types";
import { tableStickyHeader } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TableHeader({ children, className = "", ...rest }: TableSectionProps) {
  return (
    <thead
      className={astralisMerge(
        "astralis:bg-surface-subtle astralis:border-b astralis:border-stroke-base",
        tableStickyHeader,
        className,
      )}
      {...rest}
    >
      {children}
    </thead>
  );
}
