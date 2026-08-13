/* ==========================================================================
   ASTRALIS — SIZING VALUE MAPS (var-channel)
   --------------------------------------------------------------------------
   token -> CSS VALUE, not token -> class. Sizing props are channel props (see
   const/channel.ts): the engine emits one fixed class per prop
   (`astralis-w`, `astralis-w-md`, ... in theme/channels.css) and delivers the
   value below through a custom property on the style attribute.

   Values reference theme/tokens/size.css, which already declares every rung —
   numeric steps, t-shirt sizes, fractions, keywords, and viewport units — so
   runtime theming keeps cascading. Special cases:
     - "0" has no token variable — literal 0.
     - fractional/slash tokens are declared with escaped idents in CSS
       (`--astralis-size-0\.5`, `--astralis-size-1\/2`) and the var()
       references must carry the same escapes.
     - "screen" resolves per family: 100vw for widths, 100vh for heights
       (via the vw/vh size tokens).
     - "prose" (w-family) is the literal 65ch, matching the @theme value.

   Each family mirrors the exact token set of its old class map — including
   which maps accept "auto" — so the public prop types are unchanged.
   ========================================================================== */

const SIZE_STEPS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "6", "7", "8",
  "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44",
  "48", "52", "56", "60", "64", "72", "80", "96",
] as const;

const T_SHIRTS = [
  "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl",
  "6xl", "7xl", "8xl",
] as const;

const FRACTIONS = [
  "1/2", "1/3", "2/3", "1/4", "3/4", "1/5", "2/5", "3/5", "4/5", "1/6", "2/6",
  "3/6", "4/6", "5/6", "1/12", "2/12", "3/12", "4/12", "5/12", "6/12", "7/12",
  "8/12", "9/12", "10/12", "11/12",
] as const;

const CONTENT_KEYWORDS = ["full", "min", "max", "fit"] as const;
const VIEW_W = ["dvw", "svw", "lvw", "vw"] as const;
const VIEW_H = ["dvh", "svh", "lvh", "vh"] as const;

type CoreToken =
  | "0"
  | (typeof SIZE_STEPS)[number]
  | (typeof T_SHIRTS)[number]
  | (typeof FRACTIONS)[number]
  | (typeof CONTENT_KEYWORDS)[number];

export type WidthToken = CoreToken | "auto" | "screen" | (typeof VIEW_W)[number] | "prose";
export type MaxWidthToken = Exclude<WidthToken, "auto">;
export type HeightToken = CoreToken | "auto" | "screen" | (typeof VIEW_H)[number];
export type MaxBlockToken = Exclude<HeightToken, "auto">;
export type SizeToken = CoreToken | "auto" | "dvw" | "svw" | "lvw" | "dvh" | "svh" | "lvh";

import { channelMap } from "./channel";

/** `"1/2"` -> `var(--astralis-size-1\/2)` — escapes must match size.css. */
const sizeVar = (token: string): string =>
  `var(--astralis-size-${token.replace(/[./]/g, (c) => `\\${c}`)})`;

const buildCore = (): Record<CoreToken, string> => {
  const map = { "0": "0" } as Record<CoreToken, string>;
  for (const t of [...SIZE_STEPS, ...T_SHIRTS, ...FRACTIONS, ...CONTENT_KEYWORDS]) {
    map[t] = sizeVar(t);
  }
  return map;
};

const CORE = buildCore();

const viewEntries = (tokens: readonly string[]) =>
  Object.fromEntries(tokens.map((t) => [t, sizeVar(t)]));

const W_EXTRAS = { screen: sizeVar("vw"), ...viewEntries(VIEW_W), prose: "65ch" };
const H_EXTRAS = { screen: sizeVar("vh"), ...viewEntries(VIEW_H) };

const WIDTH: Record<WidthToken, string> = channelMap({ ...CORE, auto: "auto", ...W_EXTRAS }) as Record<WidthToken, string>;
const MAX_WIDTH: Record<MaxWidthToken, string> = channelMap({ ...CORE, ...W_EXTRAS }) as Record<MaxWidthToken, string>;
const HEIGHT: Record<HeightToken, string> = channelMap({ ...CORE, auto: "auto", ...H_EXTRAS }) as Record<HeightToken, string>;
const MAX_BLOCK: Record<MaxBlockToken, string> = channelMap({ ...CORE, ...H_EXTRAS }) as Record<MaxBlockToken, string>;
const SQUARE: Record<SizeToken, string> = channelMap({
  ...CORE,
  auto: "auto",
  ...viewEntries(VIEW_W.slice(0, 3)), // dvw svw lvw
  ...viewEntries(VIEW_H.slice(0, 3)), // dvh svh lvh
}) as Record<SizeToken, string>;

// Heights — h/minH/maxH all accept `auto` (mirrors the old class maps).
export const hSizing = HEIGHT;
export const minHSizing = HEIGHT;
export const maxHSizing = HEIGHT;

// Widths — `auto` on w/minW but not maxW.
export const wSizing = WIDTH;
export const minWSizing = WIDTH;
export const maxWSizing = MAX_WIDTH;

// Logical inline (writing-mode-aware width).
export const inlineSizing = WIDTH;
export const minInlineSizing = WIDTH;
export const maxInlineSizing = MAX_WIDTH;

// Logical block (writing-mode-aware height) — maxBlock drops `auto`.
export const blockSizing = HEIGHT;
export const minBlockSizing = HEIGHT;
export const maxBlockSizing = MAX_BLOCK;

// `size` sets width AND height from one value (no screen/vw/vh — ambiguous).
export const sizeSizing = SQUARE;
