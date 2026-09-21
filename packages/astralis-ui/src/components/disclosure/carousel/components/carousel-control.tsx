"use client";

import type { CarouselControlGroupProps } from "../carousel.types";
import { useCarousel } from "../carousel.context";
import { carouselControlGroupVariants } from "../carousel.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

/**
 * Lays out the carousel's navigation controls so consumers never hand-roll the
 * arrangement. Reads orientation from context: a centered bar under the slides
 * when horizontal, a full-height column beside them when vertical.
 */
export const CarouselControl = identify("Carousel.Control", function CarouselControl({ children, className = "", ...rest }: CarouselControlGroupProps) {
  const { orientation } = useCarousel();
  return (
    <div className={astralisMerge(carouselControlGroupVariants({ orientation }), className)} {...rest}>
      {children}
    </div>
  );
});
