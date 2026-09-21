import type { DataListValueProps } from "../data-list.types";
import { dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const DataListValue = identify("DataList.Value", function DataListValue({ children, className = "", style, ...rest }: DataListValueProps) {
  return (
    <dd
      className={astralisMerge("astralis:flex-1 astralis:min-w-0 astralis:text-label-base", dataListTextSize, className)}
      style={style}
      {...rest}
    >
      {children}
    </dd>
  );
});
