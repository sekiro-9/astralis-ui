import type { StatValueProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statValueSizeMap, statValueVariants } from "../stat.styles";
import { identify } from "../../../../utils/dev-identity";

export const StatValue = identify("Stat.Value", function StatValue({ children, className = "", size = "md", ...rest }: StatValueProps) {
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statValueSizeMap }, variants: statValueVariants })
          .className,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
});
