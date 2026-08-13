/* ==========================================================================
   ASTRALIS — RADIUS VALUE MAPS (var-channel)
   --------------------------------------------------------------------------
   token -> CSS VALUE, not token -> class. The rounded props are channel props
   (const/channel.ts): the class picks the corner set (astralis-rounded,
   astralis-rounded-tl, ... in theme/channels.css), the custom property
   carries the radius.

   Values reference the source radius tokens in theme/tokens/border.css
   (`--astralis-border-radius-*`), so `astralis theme` output and runtime
   theming keep cascading.
   ========================================================================== */

import { channelMap } from "./channel";

const RADIUS_TOKENS = [
  "none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full",
] as const;

export type RadiusToken = (typeof RADIUS_TOKENS)[number];

const buildRadius = (): Record<RadiusToken, string> => {
  const map = {} as Record<RadiusToken, string>;
  for (const t of RADIUS_TOKENS) map[t] = `var(--astralis-border-radius-${t})`;
  return map;
};

const RADII = channelMap(buildRadius());

export const roundedCorners = RADII;
export const roundedTCorners = RADII;
export const roundedRCorners = RADII;
export const roundedBCorners = RADII;
export const roundedLCorners = RADII;
export const roundedTlCorners = RADII;
export const roundedTrCorners = RADII;
export const roundedBrCorners = RADII;
export const roundedBlCorners = RADII;
