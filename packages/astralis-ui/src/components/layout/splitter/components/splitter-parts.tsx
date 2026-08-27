"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { useSplitterContext } from "../splitter.context";
import type { SplitterPanelProps, SplitterHandleProps } from "../splitter.types";
import {
  splitterPanel,
  splitterHandle,
  splitterHandleHorizontal,
  splitterHandleVertical,
  splitterHandleLine,
  splitterHandleLineHorizontal,
  splitterHandleLineVertical,
  splitterHandleLineActive,
} from "../splitter.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

const KEY_STEP = 2;

export function SplitterPanel({ className = "", ...rest }: SplitterPanelProps) {
  return <div data-astralis-splitter-panel="" className={astralisMerge(splitterPanel, className)} {...rest} />;
}

SplitterPanel.displayName = "Splitter.Panel";

/** The divider: `role="separator"` with the APG window-splitter keyboard
 *  contract (arrows step, Home/End jump) and pointer-capture dragging. */
export function SplitterHandle({ className = "", ...rest }: SplitterHandleProps) {
  const { orientation, size, setSize, minSize, maxSize, containerRef } = useSplitterContext();
  const [resizing, setResizing] = useState(false);
  const horizontal = orientation === "horizontal";

  const sizeFromPointer = (e: PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = horizontal ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    setSize(Math.round(ratio * 1000) / 10);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const grow = horizontal ? "ArrowRight" : "ArrowDown";
    const shrink = horizontal ? "ArrowLeft" : "ArrowUp";
    if (e.key === grow) setSize(size + KEY_STEP);
    else if (e.key === shrink) setSize(size - KEY_STEP);
    else if (e.key === "Home") setSize(minSize);
    else if (e.key === "End") setSize(maxSize);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(size)}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      data-resizing={resizing || undefined}
      onPointerDown={(e) => {
        e.preventDefault();
        // Capture keeps fast drags on the handle. Synthetic pointers (tests,
        // automation) have no capturable id — dragging still works via the
        // move events that bubble here, so a failed capture is not an error.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* uncapturable pointer */
        }
        setResizing(true);
      }}
      onPointerMove={(e) => {
        if (resizing) sizeFromPointer(e);
      }}
      onPointerUp={(e) => {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* never captured */
        }
        setResizing(false);
      }}
      onKeyDown={handleKeyDown}
      className={astralisMerge(splitterHandle, horizontal ? splitterHandleHorizontal : splitterHandleVertical, className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={astralisMerge(
          splitterHandleLine,
          horizontal ? splitterHandleLineHorizontal : splitterHandleLineVertical,
          resizing && splitterHandleLineActive,
        )}
      />
    </div>
  );
}

SplitterHandle.displayName = "Splitter.Handle";
