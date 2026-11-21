import type { DataListLabelProps } from "../data-list.types";
import { dataListLabelLayout, dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const DataListLabel = identify("DataList.Label", function DataListLabel({ children, className = "", ...props }: DataListLabelProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <dt
      className={astralisMerge(
        "astralis:font-medium astralis:text-label-muted",
        dataListTextSize,
        dataListLabelLayout,
        placementClass,
        className,
      )}
      {...rest}
    >
      {children}
    </dt>
  );
});
