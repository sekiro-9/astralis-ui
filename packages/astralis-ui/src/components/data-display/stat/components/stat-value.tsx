import type { StatValueProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statValueSizeMap, statValueVariants } from "../stat.styles";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const StatValue = identify("Stat.Value", function StatValue({ children, className = "", size = "md", ...props }: StatValueProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statValueSizeMap }, variants: statValueVariants })
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
