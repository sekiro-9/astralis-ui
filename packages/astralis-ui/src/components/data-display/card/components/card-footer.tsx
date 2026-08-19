import type { Ref } from "react";
import { cardPadding } from "../card.styles";
import type { CardFooterProps } from "../card.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function CardFooter({
  className = "",
  style,
  children,
  ref,
  ...rest
}: CardFooterProps & { ref?: Ref<HTMLDivElement> }) {
    return (
      <div
        ref={ref}
        className={astralisMerge(
          "astralis:flex astralis:items-center astralis:gap-3 astralis:border-t astralis:border-stroke-subtle",
          cardPadding,
          className,
        )}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
}

CardFooter.displayName = "Card.Footer";
