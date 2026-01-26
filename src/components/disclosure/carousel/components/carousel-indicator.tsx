import type { CarouselIndicatorProps } from "../carousel.types";
import { useCarousel } from "../carousel.context";

export function CarouselIndicator({
  index,
}: CarouselIndicatorProps) {
  const { index: activeIndex, setIndex } = useCarousel();
  const active = index === activeIndex;

  return (
    <button
      aria-current={active}
      onClick={() => setIndex(index)}
      className={[
        "astralis-h-2 astralis-w-2 astralis-rounded-full astralis-transition-colors",
        active
          ? "astralis-bg-primary"
          : "astralis-bg-gray-300 hover:astralis-bg-gray-400",
      ].join(" ")}
    />
  );
}
