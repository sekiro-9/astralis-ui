import type { StatHelpTextProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { useStatSize } from "../stat.context";
import { statHelpSizeMap, statHelpVariants } from "../stat.styles";

export function StatHelpText({ children, className = "" }: StatHelpTextProps) {
  const size = useStatSize();

  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statHelpSizeMap }, variants: statHelpVariants }),
        className,
      )}
    >
      {children}
    </span>
  );
}
