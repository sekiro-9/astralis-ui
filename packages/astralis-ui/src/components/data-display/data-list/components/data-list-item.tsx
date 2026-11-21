import type { DataListItemProps } from "../data-list.types";
import { dataListItemLayout } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const DataListItem = identify("DataList.Item", function DataListItem({ children, className = "", ...props }: DataListItemProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <div className={astralisMerge(dataListItemLayout, placementClass, className)} {...rest}>
      {children}
    </div>
  );
});
