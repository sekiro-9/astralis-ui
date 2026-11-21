import type { TableSectionProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableFooter = identify("Table.Footer", function TableFooter({ children, className = "", ...props }: TableSectionProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <tfoot className={astralisMerge("astralis:bg-surface-subtle astralis:border-t astralis:border-stroke-base astralis:font-medium", placementClass, className)} {...rest}>
      {children}
    </tfoot>
  );
});
