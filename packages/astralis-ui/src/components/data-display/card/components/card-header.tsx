import type { Ref } from "react";
import { cardPadding } from "../card.styles";
import type { CardHeaderProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardHeader = identify("Card.Header", function CardHeader({
  extra,
  className = "",
  children,
  ref,
  ...props
}: CardHeaderProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);
  const hasExtra = extra !== undefined && extra !== null;

  return (
    <div
      ref={ref}
      className={astralisMerge(
        "astralis:flex astralis:items-start astralis:justify-between astralis:gap-3",
        hasExtra ? "astralis:border-b astralis:border-stroke-subtle" : "",
        cardPadding,
        placementClass,
        className,
      )}
      {...rest}
    >
      <div className="astralis:flex astralis:flex-col astralis:gap-1 astralis:min-w-0">{children}</div>
      {hasExtra && <div className="astralis:shrink-0 astralis:flex astralis:items-center astralis:gap-2">{extra}</div>}
    </div>
  );
});
