import type { DataListValueProps } from "../data-list.types";
import { dataListTextSize } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function DataListValue({ children, className = "", style }: DataListValueProps) {
  return (
    <dd
      className={astralisMerge("astralis:flex-1 astralis:min-w-0 astralis:text-label-base", dataListTextSize, className)}
      style={style}
    >
      {children}
    </dd>
  );
}
