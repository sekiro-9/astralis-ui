import type { Ref } from "react";
import { cardRootVariants } from "../card.styles";
import type { CardRootProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CardRoot = identify("Card", function CardRoot({
  variant = "elevated",
  size = "md",
  hoverable = false,
  className = "",
  children,
  ref,
  ...props
}: CardRootProps & { ref?: Ref<HTMLDivElement> }) {
  // Placement keys become classes; everything else stays a DOM prop. Splitting
  // here is what stops `w` reaching the div as an attribute. `style` stays in
  // props so splitPlacement folds the channel vars UNDER it (user keys win) —
  // a separate style={style} before the spread would be replaced by the fold.
  const { placementClass, rest } = splitPlacement(props);

  return (
    <div
      ref={ref}
      // The size reaches Header/Body/Footer through CSS: parts carry
      // parent-keyed variants on this attribute (see cardPadding), which is
      // what lets the whole compound stay a Server Component.
      data-card-size={size}
      className={astralisMerge(
        cardRootVariants({ variant, size, hoverable }),
        placementClass,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
