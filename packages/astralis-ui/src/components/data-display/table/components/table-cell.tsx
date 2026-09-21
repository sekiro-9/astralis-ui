import type { TableCellProps } from "../table.types";
import { tableCellSize } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const TableCell = identify("Table.Cell", function TableCell({ children, className = "", ...rest }: TableCellProps) {
  return (
    <td className={astralisMerge("astralis:text-label-base", tableCellSize, className)} {...rest}>
      {children}
    </td>
  );
});
