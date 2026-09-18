"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { Portal } from "../../../overlay/portal";
import { useOverlayBehavior } from "../../../../hooks/use-overlay-behavior";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../../../icon/internal-icons";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  /** "Image 2 of 5", announced when a group navigates. */
  position?: string;
}

const SCRIM = "color-mix(in srgb, var(--astralis-color-black) 85%, transparent)";

const controlClasses =
  "astralis:inline-flex astralis:items-center astralis:justify-center astralis:rounded-full " +
  "astralis:bg-surface-raised astralis:text-label-base astralis:shadow-md astralis:cursor-pointer astralis:transition-colors " +
  "astralis:hover:bg-surface-subtle astralis:outline-none " +
  "astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring";

function Control({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`${controlClasses} ${className}`}>
      {children}
    </button>
  );
}

/**
 * The full-screen image viewer behind `Image preview` and `Image.Group`: a
 * modal dialog (focus trap and return, scroll lock, Escape through the
 * overlay stack) with zoom, rotate and, in a group, previous/next.
 */
export function ImageLightbox({ src, alt, onClose, onPrev, onNext, hasPrev, hasNext, position }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [shownSrc, setShownSrc] = useState(src);
  if (shownSrc !== src) {
    // A new image in a group starts unzoomed and upright.
    setShownSrc(src);
    setZoom(1);
    setRotate(0);
  }

  const { containerRef } = useOverlayBehavior(true, (open) => {
    if (!open) onClose();
  });

  // Paging to the first or last image removes the arrow button that had
  // focus; keep focus in the dialog so the arrow keys keep working.
  useEffect(() => {
    const dialog = containerRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }, [hasPrev, hasNext, containerRef]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" && hasPrev && onPrev) {
      event.preventDefault();
      onPrev();
    } else if (event.key === "ArrowRight" && hasNext && onNext) {
      event.preventDefault();
      onNext();
    }
  };

  return (
    <Portal>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={alt ? `Image preview: ${alt}` : "Image preview"}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="astralis:fixed astralis:inset-0 astralis:z-high astralis:flex astralis:items-center astralis:justify-center astralis:outline-none"
      >
        <div aria-hidden="true" className="astralis:absolute astralis:inset-0" style={{ backgroundColor: SCRIM }} onClick={onClose} />

        <div className="astralis:absolute astralis:top-4 astralis:right-4 astralis:flex astralis:items-center astralis:gap-2">
          <Control label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="astralis:size-9">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="astralis:h-4 astralis:w-4">
              <path d="M3.5 7.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5zM11.354 11.354a1 1 0 0 0 1.415-1.414l-4-4a1 1 0 0 0-1.414 1.414l4 4z" />
              <path d="M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
            </svg>
          </Control>
          <Control label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="astralis:size-9">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="astralis:h-4 astralis:w-4">
              <path d="M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
              <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1A6.538 6.538 0 0 1 10.343 11.742zM6.5 13a.5.5 0 0 1-.5-.5V8H2.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 1 0V7h3.5a.5.5 0 0 1 0 1H7v3.5a.5.5 0 0 1-.5.5z" />
            </svg>
          </Control>
          <Control label="Rotate" onClick={() => setRotate((r) => r + 90)} className="astralis:size-9">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="astralis:h-4 astralis:w-4">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
          </Control>
          <Control label="Close preview" onClick={onClose} className="astralis:size-9">
            <XIcon aria-hidden="true" className="astralis:h-4 astralis:w-4" />
          </Control>
        </div>

        {hasPrev && onPrev && (
          <Control label="Previous image" onClick={onPrev} className="astralis:absolute astralis:left-4 astralis:size-10">
            <ChevronLeftIcon aria-hidden="true" className="astralis:h-5 astralis:w-5" />
          </Control>
        )}

        <img
          src={src}
          alt={alt}
          className="astralis:relative"
          style={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            transform: `scale(${zoom}) rotate(${rotate}deg)`,
            transition: "transform 0.2s ease",
            borderRadius: 8,
            objectFit: "contain",
          }}
        />

        {hasNext && onNext && (
          <Control label="Next image" onClick={onNext} className="astralis:absolute astralis:right-4 astralis:size-10">
            <ChevronRightIcon aria-hidden="true" className="astralis:h-5 astralis:w-5" />
          </Control>
        )}

        {position && (
          <p
            aria-live="polite"
            className="astralis:absolute astralis:bottom-4 astralis:rounded-full astralis:bg-surface-raised astralis:px-3 astralis:py-1 astralis:text-xs astralis:text-label-base astralis:shadow-md"
          >
            {position}
          </p>
        )}
      </div>
    </Portal>
  );
}
