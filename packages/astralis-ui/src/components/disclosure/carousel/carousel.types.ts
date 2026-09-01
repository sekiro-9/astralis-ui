import type { PlacementProps } from "../../../utils/placement";
import type { ComponentPropsWithoutRef, ReactNode, CSSProperties } from "react";
import type { ColorScheme } from "../../../const/color-schemes";

export type CarouselAnimation = "slide" | "fade";
export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselIndicatorVariant = "dot" | "line" | "number";
export type CarouselSize = "sm" | "md" | "lg";

export interface CarouselProps extends ComponentPropsWithoutRef<"div">, PlacementProps {
  /** Active leading-slide index (controlled). */
  index?: number;
  /** Initial index when uncontrolled. @default 0 */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  beforeChange?: (from: number, to: number) => void;
  afterChange?: (current: number) => void;

  /** Slides visible at once. Fractional values (e.g. 1.2) peek the next slide. @default 1 */
  slidesPerView?: number;
  /** Slides advanced per Prev/Next/swipe step. @default 1 */
  slidesToScroll?: number;
  /** Gap between slides, in pixels. @default 0 */
  slideGap?: number;

  /** Wrap from last step to first (and back). @default false */
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;

  /** `slide` translates the track; `fade` cross-fades stacked slides (single view). @default "slide" */
  animation?: CarouselAnimation;
  orientation?: CarouselOrientation;
  /** Transition duration in ms. @default 300 */
  speed?: number;
  easing?: string;
  disabled?: boolean;
  swipeable?: boolean;
  draggable?: boolean;

  /** Sizing of the built-in controls and indicators. @default "md" */
  size?: CarouselSize;
  /** Hue for active indicators and focus rings. @default "brand" */
  colorScheme?: ColorScheme;

  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface CarouselTrackProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export interface CarouselSlideProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

/** Lays out the navigation controls (Prev/Next/Indicators/etc.); orientation-aware. */
export interface CarouselControlGroupProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export interface CarouselControlProps extends ComponentPropsWithoutRef<"button"> {
  /** Override the default chevron icon. */
  icon?: ReactNode;
  className?: string;
}

export interface CarouselIndicatorProps extends ComponentPropsWithoutRef<"button"> {
  index: number;
  className?: string;
}

export interface CarouselIndicatorsProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  /** @default "dot" */
  variant?: CarouselIndicatorVariant;
}

export interface CarouselProgressTextProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  format?: (index: number, total: number) => ReactNode;
}

export interface CarouselAutoPlayTriggerProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  className?: string;
  children?: (isPlaying: boolean) => ReactNode;
}
