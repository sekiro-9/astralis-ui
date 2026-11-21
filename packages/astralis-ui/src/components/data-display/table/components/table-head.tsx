import type { TableHeadProps } from "../table.types";
import { tableCellSize } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableHead = identify("Table.Head", function TableHead({ children, className = "", scope = "col", ...props }: TableHeadProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <th
      scope={scope}
      className={astralisMerge("astralis:text-left astralis:font-medium astralis:text-label-muted astralis:whitespace-nowrap", tableCellSize, placementClass, className)}
      {...rest}
    >
      {children}
    </th>
  );
});
