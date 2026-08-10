import type { Ref } from "react";
import type { StatProps } from "../stat.types";
import { StatContext } from "../stat.context";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { resolveStyleProps } from "../../../../utils/responsive";
import { statAlignMap, statRootVariants } from "../stat.styles";

export function StatRoot({
  children,
  className = "",
  size = "md",
  align,
  ref,
  ...props
}: StatProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    // `size` is passed down rather than resolved here: each part maps it to a
    // different type rung, so resolving once at the root would need the root to
    // know all three scales.
    <StatContext.Provider value={{ size }}>
      <div
        ref={ref}
        className={astralisMerge(
          resolveStyleProps({ align }, { maps: { align: statAlignMap }, variants: statRootVariants }),
          placementClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </StatContext.Provider>
  );
}

StatRoot.displayName = "Stat.Root";
