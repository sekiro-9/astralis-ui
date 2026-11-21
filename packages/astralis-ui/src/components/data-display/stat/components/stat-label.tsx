import type { StatLabelProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statLabelSizeMap, statLabelVariants } from "../stat.styles";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const StatLabel = identify("Stat.Label", function StatLabel({ children, className = "", size = "md", ...props }: StatLabelProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statLabelSizeMap }, variants: statLabelVariants })
          .className,
        placementClass,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
});
