import type { TableSectionProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableBody = identify("Table.Body", function TableBody({ children, className = "", ...props }: TableSectionProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <tbody className={astralisMerge("astralis:divide-y astralis:divide-stroke-subtle", placementClass, className)} {...rest}>
      {children}
    </tbody>
  );
});
