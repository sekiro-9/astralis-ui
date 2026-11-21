/* ==========================================================================
   ASTRALIS — TRANSFORM VALUE MAPS
   --------------------------------------------------------------------------
   scale, translateX, translateY and rotate are channel props
   (const/channel.ts), so a hover, focus or active state and a breakpoint can
   each change them. They write the individual CSS properties (`scale`,
   `translate`, `rotate`), not `transform`, so they compose with each other
   and with a `transform` the element already has (a carousel track, a
   keyframe) instead of replacing it.

   Tokens follow Tailwind's scales: scale in percent (`"105"` is 1.05),
   translate on the spacing scale with negatives and the halves/full of the
   element's own size, rotate in degrees. A string that is not a token rides
   the variable as CSS (`scale="1.02"`, `rotate="0.5turn"`).

   transformOrigin and transition are keyword props: closed sets of classes.
   ========================================================================== */

import { channelMap } from "./channel";
import { SPACING_STEPS } from "./spacing-mappings";

const SCALE_STEPS = ["0", "50", "75", "90", "95", "100", "105", "110", "125", "150"] as const;

export type ScaleToken = (typeof SCALE_STEPS)[number];

/** `scale`: how large the element is drawn, in percent (`"105"` is 105%).
 *  It does not change the layout, so neighbours do not move. */
export const scaleTypes: Readonly<Record<ScaleToken, string>> = channelMap(
  Object.fromEntries(SCALE_STEPS.map((step) => [step, String(Number(step) / 100)])) as Record<ScaleToken, string>,
);

const TRANSLATE_FRACTIONS = { "1/2": "50%", full: "100%" } as const;

type TranslateStep = "0" | (typeof SPACING_STEPS)[number] | keyof typeof TRANSLATE_FRACTIONS;
export type TranslateToken = TranslateStep | `-${Exclude<TranslateStep, "0">}`;

const spacingVar = (step: string): string => `var(--astralis-spacing-${step.replace(/\./g, "\\.")})`;

const buildTranslate = (): Record<TranslateToken, string> => {
  const map = { "0": "0" } as Record<TranslateToken, string>;
  const steps: [string, string][] = [
    ...SPACING_STEPS.map((step): [string, string] => [step, spacingVar(step)]),
    ...Object.entries(TRANSLATE_FRACTIONS),
  ];
  for (const [step, css] of steps) {
    map[step as TranslateToken] = css;
    map[`-${step}` as TranslateToken] = `calc(${css} * -1)`;
  }
  return map;
};

/** `translateX` / `translateY`: shifts the element from where the layout put
 *  it, on the spacing scale (`"-1"` lifts by 0.25rem); `"1/2"` and `"full"`
 *  are fractions of its own size. Neighbours do not move. */
export const translateTypes: Readonly<Record<TranslateToken, string>> = channelMap(buildTranslate());

const ROTATE_STEPS = ["0", "1", "2", "3", "6", "12", "45", "90", "180"] as const;

type RotateStep = (typeof ROTATE_STEPS)[number];
export type RotateToken = RotateStep | `-${Exclude<RotateStep, "0">}`;

const buildRotate = (): Record<RotateToken, string> => {
  const map = { "0": "0deg" } as Record<RotateToken, string>;
  for (const step of ROTATE_STEPS.slice(1)) {
    map[step as RotateToken] = `${step}deg`;
    map[`-${step}` as RotateToken] = `-${step}deg`;
  }
  return map;
};

/** `rotate`, in degrees, clockwise; negative turns the other way. */
export const rotateTypes: Readonly<Record<RotateToken, string>> = channelMap(buildRotate());

/** `transformOrigin`: the point scale and rotate work around. */
export const transformOriginTypes = {
  center: "astralis:origin-center",
  top: "astralis:origin-top",
  "top-right": "astralis:origin-top-right",
  right: "astralis:origin-right",
  "bottom-right": "astralis:origin-bottom-right",
  bottom: "astralis:origin-bottom",
  "bottom-left": "astralis:origin-bottom-left",
  left: "astralis:origin-left",
  "top-left": "astralis:origin-top-left",
} as const;

/** `transition`: which property changes animate, over the library's standard
 *  200 ms. Declared in theme/motion.css inside `prefers-reduced-motion:
 *  no-preference`, so with reduced motion the change applies at once. */
export const transitionTypes = {
  none: "astralis:motion-transition-none",
  colors: "astralis:motion-transition-colors",
  transform: "astralis:motion-transition-transform",
  common: "astralis:motion-transition-common",
} as const;
