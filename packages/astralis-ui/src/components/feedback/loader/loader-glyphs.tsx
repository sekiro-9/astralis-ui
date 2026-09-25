import type { CSSProperties, JSX } from "react";
import { SpinnerIcon } from "../../icon/internal-icons";
import type { LoaderVariant } from "./loader.types";

/*
 * The keyframes live in theme/tokens/animation.css and are applied inline, as
 * Progress does: an arbitrary Tailwind animation class would not be generated
 * into the precompiled stylesheet.
 */
function motion(name: string, seconds: number, delay: number, easing = "var(--astralis-easing-ease-out)"): CSSProperties {
  return {
    animation: `${name} ${seconds}s ${easing} ${delay}s infinite both`,
    transformBox: "fill-box",
    transformOrigin: "center",
  };
}

const SVG = { viewBox: "0 0 32 32", fill: "currentColor", "aria-hidden": true, className: "astralis:size-full" } as const;

/** The Astralis mark: three blocks drop into place, the fourth lands tipped. */
function Blocks() {
  return (
    <svg {...SVG} overflow="visible">
      <rect x="3" y="17" width="12" height="12" rx="3" style={motion("astralis-loader-place", 1.8, 0)} />
      <rect x="17" y="17" width="12" height="12" rx="3" style={motion("astralis-loader-place", 1.8, 0.15)} />
      <rect x="3" y="3" width="12" height="12" rx="3" style={motion("astralis-loader-place", 1.8, 0.3)} />
      <rect
        x="19"
        y="1"
        width="12"
        height="12"
        rx="3"
        opacity="0.6"
        style={motion("astralis-loader-place-tipped", 1.8, 0.45)}
      />
    </svg>
  );
}

function Spinner() {
  return <SpinnerIcon className="astralis:size-full astralis:animate-spin" />;
}

function Dots() {
  return (
    <svg {...SVG}>
      {[5, 16, 27].map((cx, i) => (
        <circle key={cx} cx={cx} cy="16" r="4" style={motion("astralis-loader-dot", 1.2, i * 0.16, "ease-in-out")} />
      ))}
    </svg>
  );
}

function Bars() {
  return (
    <svg {...SVG}>
      {[2, 10, 18, 26].map((x, i) => (
        <rect key={x} x={x} y="4" width="4" height="24" rx="2" style={motion("astralis-loader-bar", 1, i * 0.12, "ease-in-out")} />
      ))}
    </svg>
  );
}

function Pulse() {
  const ring = { cx: 16, cy: 16, r: 14, fill: "none", stroke: "currentColor", strokeWidth: 2.5 } as const;
  return (
    <svg {...SVG}>
      <circle {...ring} style={motion("astralis-loader-ring", 1.6, 0)} />
      <circle {...ring} style={motion("astralis-loader-ring", 1.6, 0.8)} />
      <circle cx="16" cy="16" r="5" />
    </svg>
  );
}

export const LOADER_GLYPHS: Record<LoaderVariant, () => JSX.Element> = {
  blocks: Blocks,
  spinner: Spinner,
  dots: Dots,
  bars: Bars,
  pulse: Pulse,
};
