"use client";

import { useCarousel } from "../carousel.context";
import type { CarouselProgressTextProps } from "../carousel.types";
import { carouselProgressVariants } from "../carousel.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const CarouselProgressText = identify("Carousel.ProgressText", function CarouselProgressText({ className = "", format, ...rest }: CarouselProgressTextProps) {
  const { index, slideCount } = useCarousel();
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Slide ${index + 1} of ${slideCount}`}
      className={astralisMerge(carouselProgressVariants(), className)}
      {...rest}
    >
      {format ? format(index, slideCount) : `${index + 1} / ${slideCount}`}
    </div>
  );
});
