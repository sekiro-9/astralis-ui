import { useEffect } from "react";
import type { CarouselSlideProps } from "../carousel.types";
import { useCarousel } from "../carousel.context";

export function CarouselSlide({
  children,
}: CarouselSlideProps) {
  const { registerSlide } = useCarousel();

  useEffect(() => {
    registerSlide();
  }, [registerSlide]);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      className="astralis-w-full astralis-flex-shrink-0"
    >
      {children}
    </div>
  );
}
