import type { StatHelpTextProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { inheritProps } from "../../../../utils/inherit-props";
import { statHelpSizeMap, statHelpVariants } from "../stat.styles";
import { StatIndicator } from "./stat-indicator";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const StatHelpText = identify("Stat.HelpText", function StatHelpText({ children, className = "", size = "md", ...props }: StatHelpTextProps) {
  const { placementClass, rest } = splitPlacement(props);
  return (
    <span
      className={astralisMerge(
        resolveStyleProps({ size }, { maps: { size: statHelpSizeMap }, variants: statHelpVariants })
          .className,
        placementClass,
        className,
      )}
      {...rest}
    >
      {/* The indicator's documented home is inside the help text, one level
          below the root's reach — so the help text re-injects the size. */}
      {inheritProps(children, new Map([[StatIndicator, { size }]]))}
    </span>
  );
});
