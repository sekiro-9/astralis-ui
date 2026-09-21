"use client";

import { useCarousel } from "../carousel.context";
import type { CarouselAutoPlayTriggerProps } from "../carousel.types";
import { carouselControlVariants, controlIconSize } from "../carousel.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import Icon from "../../../icon/icon";
import { PlayIcon, PauseIcon } from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

export const CarouselAutoPlayTrigger = identify("Carousel.AutoPlayTrigger", function CarouselAutoPlayTrigger({ className = "", children, onClick, ...rest }: CarouselAutoPlayTriggerProps) {
  const { isPlaying, toggleAutoPlay, disabled, size } = useCarousel();
  return (
    <button
      type="button"
      aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
      aria-pressed={isPlaying}
      disabled={disabled}
      onClick={(e) => { onClick?.(e); toggleAutoPlay(); }}
      className={astralisMerge(carouselControlVariants({ size }), className)}
      {...rest}
    >
      {children ? (
        children(isPlaying)
      ) : (
        <Icon size={controlIconSize[size]}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Icon>
      )}
    </button>
  );
});
