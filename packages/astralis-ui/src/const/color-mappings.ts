/* ==========================================================================
   ASTRALIS — COLOUR VALUE MAPS (var-channel)
   --------------------------------------------------------------------------
   token -> CSS value for bg / color / borderColor, derived from the palette
   tables in theme/token-spec.ts so a new hue or step needs no edit here.

   Every palette accepts the same two vocabularies:
     - a bare hue, which means the role that prop usually wants:
         bg="red" -> red-solid, color="red" -> red-label, borderColor="red" -> red-stroke
     - the role spelled out: bg="red-subtle", color="red-contrast", borderColor="red-stroke"
   plus every ramp step (bg="red-100").
   ========================================================================== */

import { channelMap } from "./channel";
import { HUES, STEPS, type Hue, type Role, type Step } from "../theme/token-spec";

const colorVar = (name: string) => `var(--astralis-color-${name})`;

const BASICS = {
  transparent: "transparent",
  current: "currentColor",
  inherit: "inherit",
  black: colorVar("black"),
  white: colorVar("white"),
} as const;

type RampToken = `${Hue}-${Step}`;

function ramps(): Record<RampToken, string> {
  const map = {} as Record<RampToken, string>;
  for (const hue of HUES) {
    for (const step of STEPS) map[`${hue}-${step}`] = colorVar(`${hue}-${step}`);
  }
  return map;
}

/** Bare hue -> `bare` role, plus `{hue}-{role}` for each listed role. */
function palettes<R extends Role>(bare: R, roles: readonly R[]): Record<Hue | `${Hue}-${R}`, string> {
  const map = {} as Record<Hue | `${Hue}-${R}`, string>;
  for (const hue of HUES) {
    map[hue] = colorVar(`${hue}-${bare}`);
    for (const role of roles) map[`${hue}-${role}`] = colorVar(`${hue}-${role}`);
  }
  return map;
}

export const bgColors = channelMap({
  base: colorVar("surface-base"),
  muted: colorVar("surface-muted"),
  subtle: colorVar("surface-subtle"),
  // Floating layers only — identical to `base` in light, one step lighter in
  // dark where a shadow cannot read. Not a fourth neutral.
  raised: colorVar("surface-raised"),
  inverted: colorVar("surface-inverted"),
  ...BASICS,
  ...ramps(),
  ...palettes("solid", ["solid", "subtle", "muted"]),
});

export const textColors = channelMap({
  base: colorVar("label-base"),
  muted: colorVar("label-muted"),
  subtle: colorVar("label-subtle"),
  inverted: colorVar("label-inverted"),
  ...BASICS,
  ...ramps(),
  // `label` = readable text on a surface; `solid` = the hue's signature colour
  // (matches a `bg="{hue}-solid"` sibling); `contrast` = text on a solid fill.
  ...palettes("label", ["label", "solid", "contrast"]),
});

export const borderColors = channelMap({
  base: colorVar("stroke-base"),
  muted: colorVar("stroke-muted"),
  subtle: colorVar("stroke-subtle"),
  inverted: colorVar("stroke-inverted"),
  // Form-control boundaries: clears 3:1 on the page (WCAG 1.4.11).
  control: colorVar("stroke-control"),
  ...BASICS,
  ...ramps(),
  ...palettes("stroke", ["stroke"]),
});
