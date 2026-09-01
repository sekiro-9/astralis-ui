import type { StatLabelProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statLabelSizeMap, statLabelVariants } from "../stat.styles";

export function StatLabel({ children, className = "", size = "md", ...rest }: StatLabelProps) {
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
}
