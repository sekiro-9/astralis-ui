import type { DataListItemProps } from "../data-list.types";
import { dataListItemLayout } from "../data-list.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function DataListItem({ children, className = "", style, ...rest }: DataListItemProps) {
  return (
    <div className={astralisMerge(dataListItemLayout, className)} style={style} {...rest}>
      {children}
    </div>
  );
}
