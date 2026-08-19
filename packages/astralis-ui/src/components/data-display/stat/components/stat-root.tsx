import type { Ref } from "react";
import type { StatProps } from "../stat.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { resolveStyleProps } from "../../../../utils/responsive";
import { inheritProps } from "../../../../utils/inherit-props";
import { statAlignMap, statRootVariants } from "../stat.styles";
import { StatLabel } from "./stat-label";
import { StatValue } from "./stat-value";
import { StatHelpText } from "./stat-help-text";
import { StatIndicator } from "./stat-indicator";

export function StatRoot({
  children,
  className = "",
  size = "md",
  align,
  ref,
  ...props
}: StatProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  // `size` is cloned into the parts unresolved rather than resolved here:
  // each part maps it to a different type rung, so resolving once at the root
  // would need the root to know all three scales. Cloning (not context) keeps
  // the whole compound a Server Component. HelpText re-injects into a nested
  // Indicator — its documented home is the help-text line.
  const sized = new Map<unknown, Record<string, unknown>>([
    [StatLabel, { size }],
    [StatValue, { size }],
    [StatHelpText, { size }],
    [StatIndicator, { size }],
  ]);

  return (
    <div
      ref={ref}
      className={astralisMerge(
        resolveStyleProps({ align }, { maps: { align: statAlignMap }, variants: statRootVariants })
          .className,
        placementClass,
        className,
      )}
      {...rest}
    >
      {inheritProps(children, sized)}
    </div>
  );
}

StatRoot.displayName = "Stat.Root";
