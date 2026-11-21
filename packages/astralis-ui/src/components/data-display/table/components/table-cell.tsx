import type { TableCellProps } from "../table.types";
import { tableCellSize } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableCell = identify("Table.Cell", function TableCell({ children, className = "", width, height, ...props }: TableCellProps) {
  // `width`/`height` are the cell's HTML attributes here; splitPlacement
  // would read them as the long spellings of `w`/`h`.
  const { placementClass, rest } = splitPlacement(props);
  return (
    <td className={astralisMerge("astralis:text-label-base", tableCellSize, placementClass, className)} width={width} height={height} {...rest}>
      {children}
    </td>
  );
});
