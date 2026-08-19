import type { StatValueProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statValueSizeMap, statValueVariants } from "../stat.styles";

export function StatValue({ children, className = "", size = "md" }: StatValueProps) {
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statValueSizeMap }, variants: statValueVariants })
          .className,
        className,
      )}
    >
      {children}
    </span>
  );
}
