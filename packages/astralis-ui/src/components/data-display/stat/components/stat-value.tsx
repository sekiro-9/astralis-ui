import type { StatValueProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { useStatSize } from "../stat.context";
import { statValueSizeMap, statValueVariants } from "../stat.styles";

export function StatValue({ children, className = "" }: StatValueProps) {
  const size = useStatSize();

  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statValueSizeMap }, variants: statValueVariants }),
        className,
      )}
    >
      {children}
    </span>
  );
}
