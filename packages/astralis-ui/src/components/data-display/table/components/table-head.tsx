import type { TableHeadProps } from "../table.types";
import { tableCellSize } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TableHead({ children, className = "", scope = "col", ...rest }: TableHeadProps) {
  return (
    <th
      scope={scope}
      className={astralisMerge("astralis:text-left astralis:font-medium astralis:text-label-muted astralis:whitespace-nowrap", tableCellSize, className)}
      {...rest}
    >
      {children}
    </th>
  );
}
