import type { Ref } from "react";
import { CardContext } from "../card.context";
import { cardRootVariants } from "../card.styles";
import type { CardRootProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";

export function CardRoot({
  variant = "elevated",
  size = "md",
  hoverable = false,
  className = "",
  style,
  children,
  ref,
  ...props
}: CardRootProps & { ref?: Ref<HTMLDivElement> }) {
  // Placement keys become classes; everything else stays a DOM prop. Splitting
  // here is what stops `w` reaching the div as an attribute.
  const { placementClass, rest } = splitPlacement(props);

  return (
    <CardContext.Provider value={{ size }}>
      <div
        ref={ref}
        className={astralisMerge(
          cardRootVariants({ variant, size, hoverable }),
          placementClass,
          className,
        )}
        style={style}
        {...rest}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

CardRoot.displayName = "Card.Root";
