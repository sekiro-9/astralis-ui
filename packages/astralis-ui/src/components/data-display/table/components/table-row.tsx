import type { TableRowProps } from "../table.types";
import { tableRowState } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableRow = identify("Table.Row", function TableRow({ children, className = "", ...props }: TableRowProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <tr className={astralisMerge("astralis:transition-colors", tableRowState, placementClass, className)} {...rest}>
      {children}
    </tr>
  );
});
