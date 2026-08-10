import type { StatLabelProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { useStatSize } from "../stat.context";
import { statLabelSizeMap, statLabelVariants } from "../stat.styles";

export function StatLabel({ children, className = "" }: StatLabelProps) {
  const size = useStatSize();

  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statLabelSizeMap }, variants: statLabelVariants }),
        className,
      )}
    >
      {children}
    </span>
  );
}
