import type { Ref } from "react";
import { cardPadding } from "../card.styles";
import type { CardBodyProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const CardBody = identify("Card.Body", function CardBody({
  className = "",
  style,
  children,
  ref,
  ...rest
}: CardBodyProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={astralisMerge(cardPadding, "astralis:text-label-base", className)} style={style} {...rest}>
      {children}
    </div>
  );
});
