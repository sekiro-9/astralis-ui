import type { DataListLabelProps } from "../data-list.types";
import { dataListLabelLayout, dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function DataListLabel({ children, className = "", style }: DataListLabelProps) {
  return (
    <dt
      className={astralisMerge(
        "astralis:font-medium astralis:text-label-muted",
        dataListTextSize,
        dataListLabelLayout,
        className,
      )}
      style={style}
    >
      {children}
    </dt>
  );
}
