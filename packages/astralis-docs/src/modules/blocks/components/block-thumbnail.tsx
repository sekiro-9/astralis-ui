"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The canvas every thumbnail renders into, before being scaled to fit its card.
 *
 * Fixed rather than measured: cards must all be the same height so their
 * dividers, titles and id chips line up, and deriving that from the tallest
 * block in view made the canvas depend on which filter was active. 1440x900 is
 * a real desktop viewport, so page-level blocks (`min-h-screen` auth screens)
 * fill it exactly and shorter sections centre inside it.
 */
const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

interface BlockThumbnailProps {
  id: string;
  name: string;
  /** Skip lazy-loading for cards above the fold. */
  eager?: boolean;
}

/**
 * A live, scaled-down desktop render of a block.
 *
 * The iframe is laid out at a real 1440px and shrunk with `scale()`, rather
 * than being given the card's width directly — a 380px-wide iframe would
 * resolve the block's `lg:` breakpoints as mobile and the thumbnail would show
 * the wrong layout entirely.
 *
 * Only the scale is measured: `scale()` needs a unitless number, and
 * `calc(100cqw / 1440)` divides a length by a number, which yields a length and
 * is dropped as invalid.
 */
export function BlockThumbnail({ id, name, eager = false }: BlockThumbnailProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Measure on commit rather than waiting for the observer's first delivery:
    // ResizeObserver callbacks run in the rendering lifecycle, so a card in a
    // backgrounded or non-compositing tab would sit at scale 0 indefinitely.
    const measure = () => {
      const width = wrapper.getBoundingClientRect().width;
      // A card filtered out of the active category is `display: none` and
      // measures 0. Holding the last good scale means it is already correct
      // when its category comes back, instead of collapsing to zero and
      // flashing while it is re-measured.
      if (width > 0) setScale(width / FRAME_WIDTH);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden bg-surface"
      style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
    >
      <iframe
        src={`/preview/blocks/${id}`}
        title={`${name} preview`}
        loading={eager ? "eager" : "lazy"}
        tabIndex={-1}
        scrolling="no"
        onLoad={() => setLoaded(true)}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
          // Two things have to be true before the frame is worth showing: it
          // has a measured scale (at 0 it would flash full-size in the corner
          // of the card) and its document has painted (revealing on scale
          // alone showed a blank white page first).
          visibility: scale && loaded ? "visible" : "hidden",
        }}
      />
    </div>
  );
}
