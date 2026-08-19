import type { StatHelpTextProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { inheritProps } from "../../../../utils/inherit-props";
import { statHelpSizeMap, statHelpVariants } from "../stat.styles";
import { StatIndicator } from "./stat-indicator";

export function StatHelpText({ children, className = "", size = "md" }: StatHelpTextProps) {
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statHelpSizeMap }, variants: statHelpVariants })
          .className,
        className,
      )}
    >
      {/* The indicator's documented home is inside the help text, one level
          below the root's reach — so the help text re-injects the size. */}
      {inheritProps(children, new Map([[StatIndicator, { size }]]))}
    </span>
  );
}
