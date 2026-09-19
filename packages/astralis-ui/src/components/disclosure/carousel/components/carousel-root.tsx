"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { usePrefersReducedMotion } from "../../../../hooks/use-prefers-reduced-motion";
import { CarouselContext } from "../carousel.context";
import type { CarouselProps } from "../carousel.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";

export function CarouselRoot({
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  beforeChange,
  afterChange,
  slidesPerView = 1,
  slidesToScroll = 1,
  slideGap = 0,
  loop = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  pauseOnHover = true,
  animation = "slide",
  orientation = "horizontal",
  speed = 300,
  easing = "ease-out",
  disabled = false,
  swipeable = true,
  draggable = false,
  size = "md",
  colorScheme = "brand",
  className = "",
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  children,
  ...rest
}: CarouselProps) {
  const { placementClass, rest: domProps } = splitPlacement(rest);
  const [index, setIndex] = useControllableState({ value: controlledIndex, defaultValue: defaultIndex, onChange: onIndexChange });
  const [slideCount, setSlideCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  useEffect(() => { setIsPlaying(autoPlay); }, [autoPlay]);

  // The hover pause is state, so leaving re-arms the timer instead of the
  // tick that fired mid-hover ending autoplay for good.
  const [hovered, setHovered] = useState(false);
  const paused = pauseOnHover && hovered;

  // `fade` only ever shows one slide; otherwise the last page starts here.
  const perView = animation === "fade" ? 1 : slidesPerView;
  const lastIndex = Math.max(0, Math.ceil(slideCount - perView));

  const afterTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const timers = afterTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (disabled) return;
      // Past an edge, land on the edge page first; only a step from the edge
      // itself wraps (with `loop`), so a partial last page is never skipped.
      const clamped = Math.min(Math.max(0, next), lastIndex);
      const target = loop && clamped === index && next !== index ? (next > index ? 0 : lastIndex) : clamped;
      if (target === index) return;
      beforeChange?.(index, target);
      setIndex(target);
      if (afterChange) {
        const timer = setTimeout(() => {
          afterTimers.current.delete(timer);
          afterChange(target);
        }, speed);
        afterTimers.current.add(timer);
      }
    },
    [disabled, loop, lastIndex, index, setIndex, beforeChange, afterChange, speed],
  );

  // A self-resetting timeout chain, re-armed on every index change. Held while
  // the OS asks for reduced motion (WCAG 2.3.3); manual navigation still works.
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (!isPlaying || paused || disabled || reducedMotion || slideCount <= 1) return;
    const timer = setTimeout(() => {
      if (!loop && index >= lastIndex) setIsPlaying(false);
      else goTo(index + slidesToScroll);
    }, autoPlayInterval);
    return () => clearTimeout(timer);
  }, [isPlaying, paused, disabled, reducedMotion, slideCount, loop, index, lastIndex, slidesToScroll, autoPlayInterval, goTo]);

  const toggleAutoPlay = useCallback(() => setIsPlaying((p) => !p), []);

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(e);
    setHovered(true);
  };
  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    setHovered(false);
  };

  // Arrow keys move by a page; the orientation picks the axis.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (e.key === prevKey) { e.preventDefault(); goTo(index - slidesToScroll); }
    else if (e.key === nextKey) { e.preventDefault(); goTo(index + slidesToScroll); }
  };

  const ctx = useMemo(
    () => ({
      index, setIndex: goTo, slideCount, setSlideCount, lastIndex,
      slidesPerView: perView, slidesToScroll, slideGap,
      orientation, animation, speed, easing, size,
      loop, disabled, swipeable, draggable,
      isPlaying, toggleAutoPlay,
    }),
    [index, goTo, slideCount, lastIndex, perView, slidesToScroll, slideGap,
     orientation, animation, speed, easing, size, loop, disabled, swipeable, draggable, isPlaying, toggleAutoPlay],
  );

  // Vertical lays the viewport and controls side by side; horizontal stacks them.
  const layout = orientation === "vertical"
    ? "astralis:relative astralis:flex astralis:w-full astralis:gap-3 astralis:items-stretch"
    : "astralis:relative astralis:w-full";

  return (
    <CarouselContext.Provider value={ctx}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={astralisMerge(
          layout,
          "astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
          accentClass(colorScheme),
          placementClass,
          className,
        )}
        {...domProps}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

CarouselRoot.displayName = "Carousel";
