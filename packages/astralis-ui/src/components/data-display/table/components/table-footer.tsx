import type { TableSectionProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const TableFooter = identify("Table.Footer", function TableFooter({ children, className = "", ...rest }: TableSectionProps) {
  return (
    <tfoot className={astralisMerge("astralis:bg-surface-subtle astralis:border-t astralis:border-stroke-base astralis:font-medium", className)} {...rest}>
      {children}
    </tfoot>
  );
});
