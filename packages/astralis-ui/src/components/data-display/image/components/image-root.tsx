"use client";

import { splitPlacement } from "../../../../utils/placement";
import { useState, type KeyboardEvent, type Ref, type RefCallback } from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { ImageLightbox } from "./image-lightbox";
import {
  ASPECT_RATIO_MAP,
  FIT_MAP,
  PLACEHOLDER_SIZE_MAP,
  ROUNDED_MAP,
} from "./image.constants";
import type { ImageProps } from "../image.types";
import { identify } from "../../../../utils/dev-identity";

export const ImageRoot = identify("Image", function ImageRoot({
  src,
  alt,
  className = "",
  style,
  width,
  height,
  objectFit = "cover",
  loading = "lazy",
  srcset,
  sizes,
  placeholder = "empty",
  rounded = "none",
  aspectRatio,
  fallback,
  caption,
  preview = false,
  onLoad,
  onError,
  ariaLabel,
  ref,
  ...rest
}: ImageProps & { ref?: Ref<HTMLImageElement> }) {
    // `width`/`height` reserve the box only until a sizing prop takes over;
    // then they stay as attributes, which give the browser the aspect ratio.
    const sizedByProps = rest.w != null || rest.h != null;
    const intrinsicSize = sizedByProps ? {} : { width, height };
    const ratio = typeof width === "number" && typeof height === "number" ? `${width} / ${height}` : undefined;
    const fallbackSize: React.CSSProperties = !sizedByProps
      ? { width, height: height ?? 160 }
      : ratio
        ? { aspectRatio: ratio }
        : rest.h == null
          ? { height: height ?? 160 }
          : {};
    const { placementClass, placementStyle, rest: domRest } = splitPlacement(rest);

    // Keyed by src, so a new src starts loading again instead of inheriting
    // the previous one's loaded or failed state.
    const [settled, setSettled] = useState<{ src: string; failed: boolean } | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const isLoading = Boolean(src) && settled?.src !== src;
    const hasError = !src || (settled?.src === src && settled.failed);

    const handleLoad = () => {
      setSettled({ src, failed: false });
      onLoad?.();
    };

    const handleError = () => {
      setSettled({ src, failed: true });
      onError?.();
    };

    // The real src is in the server HTML, so the image can finish, or fail,
    // before React attaches onLoad/onError; the node itself says which.
    const attach: RefCallback<HTMLImageElement> = (node) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
      if (!node || !isLoading || !node.complete || !node.currentSrc) return;
      if (node.naturalWidth > 0) handleLoad();
      else handleError();
    };

    const lowResSrc = placeholder !== "empty" && placeholder !== "blur" ? placeholder : undefined;
    const loadingStyle: React.CSSProperties | undefined =
      isLoading && lowResSrc
        ? {
            backgroundImage: `url(${JSON.stringify(lowResSrc)})`,
            backgroundSize: PLACEHOLDER_SIZE_MAP[objectFit],
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }
        : undefined;

    const roundedClass = ROUNDED_MAP[rounded] ?? "";
    const fitClass = FIT_MAP[objectFit] ?? "";

    const ratioStyle: React.CSSProperties = aspectRatio
      ? {
          aspectRatio: ASPECT_RATIO_MAP[aspectRatio] ?? aspectRatio,
          position: "relative",
          overflow: "hidden",
        }
      : {};

    // The DOM remainder (id, data-*, aria-*) lands on the outermost element,
    // so what a caller addresses is what it sees on the page.
    const outer = caption ? "figure" : aspectRatio ? "box" : "img";
    const domProps = (target: typeof outer) => (target === outer ? domRest : {});

    // The previewable element is a keyboard-operable button that opens the
    // lightbox dialog; the ratio box when there is one, else the image.
    const canPreview = preview && !hasError;
    const openPreview = () => setIsOpen(true);
    const previewProps = (target: "box" | "img") =>
      canPreview && target === (aspectRatio ? "box" : "img")
        ? {
            role: "button",
            tabIndex: 0,
            "aria-haspopup": "dialog" as const,
            onClick: openPreview,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPreview();
              }
            },
          }
        : {};
    const previewClasses = canPreview
      ? "astralis:cursor-zoom-in astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring"
      : "";

    const imageElement = hasError ? (
      fallback ? (
        <>{fallback}</>
      ) : (
        <div
          {...domProps("img")}
          className={astralisMerge(
            "astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:gap-2",
            "astralis:bg-surface-muted astralis:text-label-subtle",
            roundedClass,
            aspectRatio ? "astralis:absolute astralis:inset-0" : placementClass,
          )}
          style={aspectRatio ? {} : { ...placementStyle, ...fallbackSize }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="astralis:h-8 astralis:w-8"
          >
            <path d="M21.9 21.9l-8.49-8.49-9.82-9.82L2.1 2.1.69 3.51 3 5.83V19c0 1.1.9 2 2 2h13.17l2.31 2.31 1.42-1.41zM5 18l3.5-4.5 2.5 3.01L12.17 15l3 3H5zm16 .17L6.83 5H19c1.1 0 2 .9 2 2v11.17z" />
          </svg>
          <span className="astralis:text-xs">Failed to load</span>
        </div>
      )
    ) : (
      <img
        {...domProps("img")}
        ref={attach}
        src={src}
        alt={alt}
        aria-label={ariaLabel}
        width={width}
        height={height}
        loading={loading}
        srcSet={srcset}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...previewProps("img")}
        className={astralisMerge(
          "astralis:transition-opacity astralis:duration-200",
          fitClass,
          roundedClass,
          isLoading && !lowResSrc && "astralis-image-loading",
          !aspectRatio && previewClasses,
          aspectRatio ? "astralis:absolute astralis:inset-0 astralis:h-full astralis:w-full" : placementClass,
          className,
        )}
        style={aspectRatio ? loadingStyle : { ...placementStyle, ...intrinsicSize, ...loadingStyle, ...style }}
      />
    );

    /*
     * Placement goes on whichever element is outermost. With an aspectRatio
     * the image is absolutely positioned inside the ratio box, so a width on
     * the image itself would do nothing — it belongs on the box. The channel
     * vars ride along with the class either way.
     */
    const wrapped = aspectRatio ? (
      <div
        {...domProps("box")}
        {...previewProps("box")}
        className={astralisMerge(placementClass, previewClasses, roundedClass)}
        style={{ ...placementStyle, ...ratioStyle, width: intrinsicSize.width, ...style }}
      >
        {imageElement}
      </div>
    ) : (
      imageElement
    );

    return (
      <>
        {caption ? (
          <figure {...domProps("figure")} className="astralis:inline-block">
            {wrapped}
            <figcaption className="astralis:mt-1.5 astralis:text-xs astralis:text-center astralis:text-label-muted">
              {caption}
            </figcaption>
          </figure>
        ) : (
          wrapped
        )}
        {canPreview && isOpen && (
          <ImageLightbox src={src} alt={alt} onClose={() => setIsOpen(false)} />
        )}
      </>
    );
});
