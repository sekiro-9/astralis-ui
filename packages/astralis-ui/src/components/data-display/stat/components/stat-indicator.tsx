import type { StatIndicatorProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statHelpSizeMap, statIndicatorVariants } from "../stat.styles";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const StatIndicator = identify("Stat.Indicator", function StatIndicator({ type = "increase", children, className = "", size = "md", ...props }: StatIndicatorProps) {
  const { placementClass, rest } = splitPlacement(props);
  const isIncrease = type === "increase";

  return (
    <span
      className={astralisMerge(
        // The indicator sits on the help-text line, so it rides that rung.
        resolveStyleProps(
          { size },
          { maps: { size: statHelpSizeMap }, variants: statIndicatorVariants },
        ).className,
        isIncrease ? "astralis:text-green-solid" : "astralis:text-red-solid",
        placementClass,
        className,
      )}
      {...rest}
    >
      <span aria-hidden>{isIncrease ? "▲" : "▼"}</span>
      {children}
    </span>
  );
});
