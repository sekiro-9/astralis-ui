import type { Ref } from "react";
import type { CardTitleProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardTitle = identify("Card.Title", function CardTitle({
  className = "",
  children,
  ref,
  ...props
}: CardTitleProps & { ref?: Ref<HTMLHeadingElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <h3
      ref={ref}
      className={astralisMerge("astralis:text-base astralis:font-semibold astralis:leading-snug astralis:text-label-base", placementClass, className)}
      {...rest}
    >
      {children}
    </h3>
  );
});
