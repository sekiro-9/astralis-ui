import type { CarouselControlProps } from "../carousel.types";
import { useCarousel } from "../carousel.context";

export function CarouselNext({
  children = "Next",
}: CarouselControlProps) {
  const { index, slideCount, setIndex } = useCarousel();

  return (
    <button
      disabled={index >= slideCount - 1}
      onClick={() => setIndex(index + 1)}
      className="astralis-absolute astralis-right-2 astralis-top-1/2 -astralis-translate-y-1/2 astralis-rounded-full astralis-bg-white astralis-shadow astralis-px-3 astralis-py-1 astralis-text-sm disabled:astralis-opacity-50"
    >
      {children}
    </button>
  );
}
