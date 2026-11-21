"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import { COLOR_SCHEMES, type ColorScheme, type ColorSchemeHue } from "../const/color-schemes";

const HUES = new Set<string>(COLOR_SCHEMES);
const SCOPE_CLASS = /(?:^|\s)astralis-accent-([a-z]+)(?=\s|$)/;

/** The hue whose accent scope `node` sits in, or undefined for the root (brand). */
function hueInScope(node: Element | null): ColorSchemeHue | undefined {
  for (let el = node; el; el = el.parentElement) {
    const hue = SCOPE_CLASS.exec(el.getAttribute("class") ?? "")?.[1];
    if (hue && HUES.has(hue)) return hue as ColorSchemeHue;
  }
  return undefined;
}

/**
 * The scheme for a part rendered in a portal (a picker's list, a popover).
 * A hue passes through. `"inherit"` cannot reach a portal through the CSS
 * cascade, which starts again under `<body>`, so it becomes the hue in scope
 * at `anchor`, read each time the part opens.
 */
export function usePortalScheme(scheme: ColorScheme, anchor: RefObject<Element | null>, open: boolean): ColorScheme;
export function usePortalScheme(
  scheme: ColorScheme | undefined,
  anchor: RefObject<Element | null>,
  open: boolean,
): ColorScheme | undefined;
export function usePortalScheme(
  scheme: ColorScheme | undefined,
  anchor: RefObject<Element | null>,
  open: boolean,
): ColorScheme | undefined {
  const [inScope, setInScope] = useState<ColorSchemeHue | undefined>(undefined);
  useLayoutEffect(() => {
    if (scheme === "inherit" && open) setInScope(hueInScope(anchor.current));
  }, [scheme, open, anchor]);
  return scheme === "inherit" ? (inScope ?? "inherit") : scheme;
}
