import type { DataListLabelProps } from "../data-list.types";
import { dataListLabelLayout, dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const DataListLabel = identify("DataList.Label", function DataListLabel({ children, className = "", style, ...rest }: DataListLabelProps) {
  return (
    <dt
      className={astralisMerge(
        "astralis:font-medium astralis:text-label-muted",
        dataListTextSize,
        dataListLabelLayout,
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </dt>
  );
});
