import type { Ref } from "react";
import { cardPadding } from "../card.styles";
import type { CardBodyProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardBody = identify("Card.Body", function CardBody({
  className = "",
  children,
  ref,
  ...props
}: CardBodyProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <div ref={ref} className={astralisMerge(cardPadding, "astralis:text-label-base", placementClass, className)} {...rest}>
      {children}
    </div>
  );
});
