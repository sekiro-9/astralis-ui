import type { TableRowProps } from "../table.types";
import { tableRowState } from "../table.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TableRow({ children, className = "", ...rest }: TableRowProps) {
  return (
    <tr className={astralisMerge("astralis:transition-colors", tableRowState, className)} {...rest}>
      {children}
    </tr>
  );
}
