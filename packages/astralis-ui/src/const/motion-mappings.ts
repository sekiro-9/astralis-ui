/* Motion props. Keyword props: each value maps to one class in
   theme/motion.css, where the animation is declared inside
   `prefers-reduced-motion: no-preference` (scripts/check-motion.mjs holds
   every one to that). */

/** `animation`: plays once when the element is rendered. */
export const animationTypes = {
  "fade-in": "astralis:animate-fade-in",
  "fade-up": "astralis:animate-fade-up",
  "fade-down": "astralis:animate-fade-down",
  "slide-left": "astralis:animate-slide-left",
  "slide-right": "astralis:animate-slide-right",
  "scale-in": "astralis:animate-scale-in",
  pop: "astralis:animate-pop",
  "blur-in": "astralis:animate-blur-in",
} as const;

/** `reveal`: plays as the element scrolls into view. Browsers without scroll
 *  timelines show the content without the animation. */
export const revealTypes = {
  "fade-in": "astralis:reveal-fade-in",
  "fade-up": "astralis:reveal-fade-up",
  "fade-down": "astralis:reveal-fade-down",
  "slide-left": "astralis:reveal-slide-left",
  "slide-right": "astralis:reveal-slide-right",
  "scale-in": "astralis:reveal-scale-in",
  pop: "astralis:reveal-pop",
  "blur-in": "astralis:reveal-blur-in",
} as const;

/** `animationDuration`: how long an `animation` takes. */
export const animationDurationTypes = {
  fast: "astralis:motion-duration-fast",
  normal: "astralis:motion-duration-normal",
  slow: "astralis:motion-duration-slow",
} as const;

/** `animationDelay`, in milliseconds: wait before an `animation` starts, for
 *  staggering siblings. */
export const animationDelayTypes = {
  "75": "astralis:motion-delay-75",
  "100": "astralis:motion-delay-100",
  "150": "astralis:motion-delay-150",
  "200": "astralis:motion-delay-200",
  "300": "astralis:motion-delay-300",
  "500": "astralis:motion-delay-500",
  "700": "astralis:motion-delay-700",
  "1000": "astralis:motion-delay-1000",
} as const;
