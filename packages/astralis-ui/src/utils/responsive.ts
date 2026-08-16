/* ==========================================================================
   ASTRALIS RESPONSIVE ENGINE
   --------------------------------------------------------------------------
   A single, prefix-aware resolution layer shared by every component.

   Every style prop accepts either a scalar token value OR a responsive map.
   Resolution has two channels:

   KEYWORD props (closed sets: display, position, alignment, ...) resolve to
   enumerated Tailwind classes, exactly as before:

     <Box display="flex" />                    -> astralis:flex
     <Box display={{ base: "hidden", md: "flex" }} />
                                               -> astralis:hidden astralis:md:flex

   CHANNEL props (open value ranges: padding, margin, ... — see
   const/channel.ts) resolve to ONE fixed class per prop per breakpoint
   (defined in theme/channels.css) plus a custom property carrying the value:

     <Box p="4" />                     -> class: astralis-p
                                          style: --astralis-p: var(--astralis-spacing-4)
     <Box p={{ base: "2", md: "4" }} /> -> class: astralis-p astralis-p-md
                                          style: --astralis-p: ...-2; --astralis-p-md: ...-4

   Components keep using CVA for keyword typing + scalar resolution +
   defaultVariants. Channel props bypass CVA entirely — their maps hold CSS
   values, not classes, and must never reach it.
   ========================================================================== */

import { isStateProp, resolveStateStyles } from "./interaction-state";
import {
  CHANNEL_PROPS,
  channelClass,
  channelVar,
  isChannelMap,
  resolveChannelToken,
} from "../const/channel";

/** Ordered breakpoints. `base` is the unprefixed/mobile-first value. */
export const BREAKPOINTS = ["sm", "md", "lg", "xl"] as const;

export type Breakpoint = (typeof BREAKPOINTS)[number];
export type ResponsiveKey = "base" | Breakpoint;

const BREAKPOINT_SET = new Set<string>(BREAKPOINTS);

/** A prop value: either a raw token, or a per-breakpoint map of tokens. */
export type ResponsiveProp<Value> =
  | Value
  | Partial<Record<ResponsiveKey, Value>>;

/** Wraps every key of a CVA variant-props object so each accepts responsive input. */
export type Responsive<T> = {
  [K in keyof T]: ResponsiveProp<NonNullable<T[K]>>;
};

/** token -> className (keyword props) or token -> CSS value (channel props). */
type TokenMap = Record<string, string>;

/**
 * Injects a breakpoint variant *inside* the astralis prefix so the output is a
 * valid Tailwind-v4 prefixed class: "astralis:p-4" + "md" -> "astralis:md:p-4".
 * Keyword props only — channel props never pass through here.
 */
function withBreakpoint(className: string, bp: Breakpoint): string {
  return className
    .split(" ")
    .filter(Boolean)
    .map((token) => {
      const colon = token.indexOf(":");
      // Unprefixed (shouldn't happen with our maps, but stay safe)
      if (colon === -1) return `${bp}:${token}`;
      // Insert the breakpoint immediately after the "astralis:" prefix
      return `${token.slice(0, colon + 1)}${bp}:${token.slice(colon + 1)}`;
    })
    .join(" ");
}

/** True when a prop value is a responsive map rather than a scalar token. */
function isResponsiveObject(
  value: unknown,
): value is Partial<Record<ResponsiveKey, string>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface ResolveStylePropsConfig {
  /** Token maps keyed by prop name — typically the same object passed to CVA `variants`. */
  maps: Record<string, TokenMap>;
  /** The CVA function for this layer; resolves scalar keyword values + defaultVariants. */
  variants: (props: Record<string, unknown>) => string;
}

/** What a bag of style props resolves to: classes plus channel variables. */
export interface ResolvedStyles {
  className: string;
  /** Custom properties for channel props — spread into the element's `style`,
   *  BEFORE any component-computed styles and the caller's own `style`, so
   *  both of those keep winning. */
  style: Record<string, string>;
}

/**
 * Resolves a bag of (possibly responsive) style props into classes + style.
 *
 * - Keyword scalars are forwarded to CVA untouched (preserving defaultVariants).
 * - Keyword responsive objects resolve per breakpoint from the token map.
 * - Channel props resolve to channel classes + custom properties; tokens are
 *   looked up with `=== undefined` (never truthiness — "0" is a real token
 *   whose value is the string "0"), and a string that is no token at all
 *   passes through raw — arbitrary values ride the var (`p="37px"`).
 */
export function resolveStyleProps(
  props: Record<string, unknown>,
  { maps, variants }: ResolveStylePropsConfig,
): ResolvedStyles {
  const baseProps: Record<string, unknown> = {};
  const classes: string[] = [];
  const style: Record<string, string> = {};

  for (const key in props) {
    const value = props[key];
    if (value === undefined) continue;

    // Interaction states are objects too, but keyed by style prop rather than
    // breakpoint. Handled here — rather than in each component's prop split —
    // so every Box-composing primitive gets them from one place and none can
    // leak `hover` onto the DOM as an attribute.
    if (isStateProp(key)) {
      const resolved = resolveStateStyles(key, value);
      if (resolved.className) classes.push(resolved.className);
      Object.assign(style, resolved.style);
      continue;
    }

    // Channel route needs BOTH the registered name AND a branded value map —
    // `size` on Text is a typography rung whose map holds classes, and it must
    // stay on the keyword path below.
    const slug = (CHANNEL_PROPS as Record<string, string | undefined>)[key];
    if (slug !== undefined && isChannelMap(maps[key])) {
      const map = maps[key];
      if (isResponsiveObject(value)) {
        for (const bp in value) {
          const token = (value as Record<string, string>)[bp];
          const css = resolveChannelToken(map, token, slug);
          if (css === undefined) continue;
          if (bp === "base") {
            classes.push(channelClass(slug));
            style[channelVar(slug)] = css;
          } else if (BREAKPOINT_SET.has(bp)) {
            classes.push(channelClass(slug, bp));
            style[channelVar(slug, bp)] = css;
          }
        }
      } else {
        const css = resolveChannelToken(map, value, slug);
        if (css !== undefined) {
          classes.push(channelClass(slug));
          style[channelVar(slug)] = css;
        }
      }
      continue;
    }

    if (isResponsiveObject(value)) {
      const map = maps[key];
      if (!map) continue;
      for (const bp in value) {
        const token = (value as Record<string, string>)[bp];
        const cls = map[token];
        if (!cls) continue;
        if (bp === "base") classes.push(cls);
        else if (BREAKPOINT_SET.has(bp)) classes.push(withBreakpoint(cls, bp as Breakpoint));
      }
    } else {
      baseProps[key] = value;
    }
  }

  return {
    className: [variants(baseProps), ...classes].filter(Boolean).join(" "),
    style,
  };
}
