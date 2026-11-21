import type { Ref } from "react";
import type { TableCaptionProps } from "../table.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const TableCaption = identify("Table.Caption", function TableCaption({
  className = "",
  placement = "bottom",
  ref,
  ...props
}: TableCaptionProps & { ref?: Ref<HTMLTableCaptionElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <caption
      ref={ref}
      className={astralisMerge(
        "astralis:text-sm astralis:text-label-muted astralis:py-2",
        placement === "top" ? "astralis:caption-top" : "astralis:caption-bottom",
        placementClass,
        className,
      )}
      {...rest}
    />
  );
});
