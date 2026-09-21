import type { Ref } from "react";
import type { MarqueeItemProps } from "../marquee.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const MarqueeItem = identify("Marquee.Item", function MarqueeItem({
  className = "",
  style,
  children,
  ref,
  ...rest
}: MarqueeItemProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={astralisMerge("astralis:inline-flex astralis:shrink-0 astralis:items-center", className)}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
});
