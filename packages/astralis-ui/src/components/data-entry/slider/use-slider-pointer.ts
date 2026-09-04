"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { snapToStep } from "./slider.utils";

interface PointerOptions {
  min: number;
  max: number;
  step: number;
  interactive: boolean;
  /** The thumb a press on the bare track should move. */
  pickThumb: (value: number) => number;
  onDrag: (thumb: number, value: number) => void;
}

/**
 * Drag handling shared by both sliders. Pointer events with pointer capture
 * cover mouse, touch and pen alike, and keep the drag alive when the pointer
 * leaves the track.
 */
export function useSliderPointer({ min, max, step, interactive, pickThumb, onDrag }: PointerOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragging = useRef<number | null>(null);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);

  const valueAt = (clientX: number) => {
    const { left, width } = trackRef.current!.getBoundingClientRect();
    const ratio = width > 0 ? Math.min(1, Math.max(0, (clientX - left) / width)) : 0;
    return snapToStep(min + ratio * (max - min), min, max, step);
  };

  const end = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current === null) return;
    dragging.current = null;
    setActiveThumb(null);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const trackHandlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive || !trackRef.current || (e.pointerType === "mouse" && e.button !== 0)) return;
      const onThumb = (e.target as HTMLElement).closest<HTMLElement>("[data-thumb-index]");
      const value = valueAt(e.clientX);
      const thumb = onThumb ? Number(onThumb.dataset.thumbIndex) : pickThumb(value);
      // Keeps the press from selecting text or moving focus to the track.
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      dragging.current = thumb;
      setActiveThumb(thumb);
      thumbRefs.current[thumb]?.focus();
      // Grabbing a thumb must not nudge it to the pointer's exact position.
      if (!onThumb) onDrag(thumb, value);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dragging.current === null || !trackRef.current) return;
      onDrag(dragging.current, valueAt(e.clientX));
    },
    onPointerUp: end,
    onPointerCancel: end,
  };

  return { trackRef, thumbRefs, activeThumb, trackHandlers };
}

export type SliderTrackHandlers = ReturnType<typeof useSliderPointer>["trackHandlers"];
