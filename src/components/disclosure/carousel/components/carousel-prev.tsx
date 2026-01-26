import type { CarouselControlProps } from "../carousel.types";
import { useCarousel } from "../carousel.context";

export function CarouselPrev({
  children = "Prev",
}: CarouselControlProps) {
  const { index, setIndex } = useCarousel();

  return (
    <button
      disabled={index <= 0}
      onClick={() => setIndex(index - 1)}
      className="astralis-absolute astralis-left-2 astralis-top-1/2 -astralis-translate-y-1/2 astralis-rounded-full astralis-bg-white astralis-shadow astralis-px-3 astralis-py-1 astralis-text-sm disabled:astralis-opacity-50"
    >
      {children}
    </button>
  );
}
