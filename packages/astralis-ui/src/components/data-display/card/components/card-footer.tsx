import type { Ref } from "react";
import { cardPadding } from "../card.styles";
import type { CardFooterProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardFooter = identify("Card.Footer", function CardFooter({
  className = "",
  children,
  ref,
  ...props
}: CardFooterProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <div
      ref={ref}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:gap-3 astralis:border-t astralis:border-stroke-subtle",
        cardPadding,
        placementClass,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
