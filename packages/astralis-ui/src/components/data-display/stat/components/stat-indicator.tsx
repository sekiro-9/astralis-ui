import type { StatIndicatorProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statHelpSizeMap, statIndicatorVariants } from "../stat.styles";

export function StatIndicator({ type = "increase", children, className = "", size = "md" }: StatIndicatorProps) {
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
        className,
      )}
    >
      <span aria-hidden>{isIncrease ? "▲" : "▼"}</span>
      {children}
    </span>
  );
}
