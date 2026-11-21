import type { Ref } from "react";
import type { CardDescriptionProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardDescription = identify("Card.Description", function CardDescription({
  className = "",
  children,
  ref,
  ...props
}: CardDescriptionProps & { ref?: Ref<HTMLParagraphElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <p
      ref={ref}
      className={astralisMerge("astralis:text-sm astralis:text-label-muted astralis:leading-relaxed", placementClass, className)}
      {...rest}
    >
      {children}
    </p>
  );
});
