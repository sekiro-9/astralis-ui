import type { DataListValueProps } from "../data-list.types";
import { dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const DataListValue = identify("DataList.Value", function DataListValue({ children, className = "", ...props }: DataListValueProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <dd
      className={astralisMerge("astralis:flex-1 astralis:min-w-0 astralis:text-label-base", dataListTextSize, placementClass, className)}
      {...rest}
    >
      {children}
    </dd>
  );
});
