import type { StatLabelProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statLabelSizeMap, statLabelVariants } from "../stat.styles";
import { identify } from "../../../../utils/dev-identity";

export const StatLabel = identify("Stat.Label", function StatLabel({ children, className = "", size = "md", ...rest }: StatLabelProps) {
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statLabelSizeMap }, variants: statLabelVariants })
          .className,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
});
