"use client";

import { splitPlacement } from "../../../../utils/placement";
import {
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
  type SyntheticEvent,
} from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { ImageLightbox } from "./image-lightbox";
import {
  ASPECT_RATIO_MAP,
  FIT_MAP,
  PLACEHOLDER_SIZE_MAP,
  ROUNDED_MAP,
} from "./image.constants";
import type { ImageAsProps, ImageComponent, ImageOwnProps, ImageProps } from "../image.types";
import { identify } from "../../../../utils/dev-identity";

interface StaticImageData {
  src: string;
  width?: number;
  height?: number;
}

/** Every prop either render path can receive, as the body reads them. */
type ImageRenderProps = ImageOwnProps & {
  as?: ElementType;
  ref?: Ref<HTMLImageElement>;
  src?: string | StaticImageData | { default: StaticImageData };
  width?: number | string;
  height?: number | string;
  loading?: "eager" | "lazy";
  srcset?: string;
  sizes?: string;
  placeholder?: string;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  [prop: string]: unknown;
};

/** A framework's static image import is an object (`{ src, width, height }`), sometimes under `default`. */
function staticImageData(src: ImageRenderProps["src"]): StaticImageData | undefined {
  if (!src || typeof src !== "object") return undefined;
  const data = "default" in src ? src.default : src;
  return typeof data?.src === "string" ? data : undefined;
}

/** Drops undefined entries: an image component that merges styles with Object.assign (Next's `fill`) would let them erase its own. */
function definedStyle(style: Record<string, unknown>): CSSProperties {
  return Object.fromEntries(Object.entries(style).filter(([, value]) => value !== undefined)) as CSSProperties;
}

// What addresses the element on the page (id, data-*, aria-*) stays on the
// outermost element; with `as`, the rest is the image component's own.
const ADDRESSING_PROP = /^(id$|data-|aria-)/;

export const ImageRoot = identify("Image", function ImageRoot(
  props: (ImageProps & { ref?: Ref<HTMLImageElement> }) | ImageAsProps<ElementType>,
) {
    const {
      as,
      src,
      alt,
      className = "",
      style,
      width,
      height,
      objectFit = "cover",
      loading,
      srcset,
      sizes,
      placeholder,
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
    } = props as ImageRenderProps;
    const imageData = staticImageData(src);
    const srcUrl = typeof src === "string" ? src : (imageData?.src ?? "");
    // A static import carries its own pixel size; the frame math reads it,
    // while the image component is handed `width`/`height` as given.
    const intrinsicWidth = width ?? imageData?.width;
    const intrinsicHeight = height ?? imageData?.height;
    // `fill` is the image component's own (Next's): it positions the picture
    // absolutely over its parent, so nothing here may size it.
    const fills = Boolean(as && rest.fill);

    // `width`/`height` reserve the box only until a sizing prop takes over;
    // then they stay as attributes, which give the browser the aspect ratio.
    const sizedByProps = fills || rest.w != null || rest.h != null;
    const intrinsicSize = sizedByProps ? {} : { width: intrinsicWidth, height: intrinsicHeight };
    const ratio =
      typeof intrinsicWidth === "number" && typeof intrinsicHeight === "number"
        ? `${intrinsicWidth} / ${intrinsicHeight}`
        : undefined;
    const fallbackSize: React.CSSProperties = fills
      ? {}
      : !sizedByProps
        ? { width: intrinsicWidth, height: intrinsicHeight ?? 160 }
        : ratio
          ? { aspectRatio: ratio }
          : rest.h == null
            ? { height: intrinsicHeight ?? 160 }
            : {};
    const { placementClass, placementStyle, rest: splitRest } = splitPlacement(rest);
    // splitPlacement folds the channel variables into `style`; Image places
    // placementStyle itself, on whichever element is outermost.
    const domRest: Record<string, unknown> = { ...splitRest };
    delete domRest.style;

    // Keyed by src, so a new src starts loading again instead of inheriting
    // the previous one's loaded or failed state.
    const [settled, setSettled] = useState<{ src: string; failed: boolean } | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const isLoading = Boolean(srcUrl) && settled?.src !== srcUrl;
    const hasError = !srcUrl || (settled?.src === srcUrl && settled.failed);

    // The same outcome can arrive twice: from the node's state on attach and
    // from the event itself, or from an image component that replays it.
    const reported = useRef<string | null>(null);
    const settle = (failed: boolean, event: SyntheticEvent<HTMLImageElement>) => {
      const outcome = `${failed}:${srcUrl}`;
      if (reported.current === outcome) return;
      reported.current = outcome;
      setSettled({ src: srcUrl, failed });
      (failed ? onError : onLoad)?.(event);
    };
    const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => settle(false, event);
    const handleError = (event: SyntheticEvent<HTMLImageElement>) => settle(true, event);

    // The real src is in the server HTML, so the image can finish, or fail,
    // before React attaches onLoad/onError. The node itself says which, and
    // replaying that as a real event reaches every handler in between: an
    // image component's own (Next's blur removal) as well as this one's.
    const attach: RefCallback<HTMLImageElement> = (node) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
      if (!node || !isLoading || !node.complete || !node.currentSrc) return;
      node.dispatchEvent(new Event(node.naturalWidth > 0 ? "load" : "error"));
    };

    // Without `as` the placeholder is Image's own; with it, the component's.
    const lowResSrc =
      !as && placeholder && placeholder !== "empty" && placeholder !== "blur" ? placeholder : undefined;
    const componentPlaceholder = Boolean(as && placeholder && placeholder !== "empty");
    const loadingStyle: React.CSSProperties | undefined =
      isLoading && lowResSrc
        ? {
            backgroundImage: `url(${JSON.stringify(lowResSrc)})`,
            backgroundSize: PLACEHOLDER_SIZE_MAP[objectFit],
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }
        : undefined;
    // Next sizes its blur from the inline objectFit, not from a class.
    const componentFit = componentPlaceholder ? { objectFit } : undefined;

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
    // so what a caller addresses is what it sees on the page. With `as`, the
    // image component takes the rest wherever it sits.
    const outer = caption ? "figure" : aspectRatio ? "box" : "img";
    const outerRest = as
      ? Object.fromEntries(Object.entries(domRest).filter(([key]) => ADDRESSING_PROP.test(key)))
      : domRest;
    const componentRest = as
      ? Object.fromEntries(
          Object.entries(domRest).filter(([key]) => outer === "img" || !ADDRESSING_PROP.test(key)),
        )
      : {};
    const domProps = (target: typeof outer) => (target === outer ? outerRest : {});

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

    const imageClassName = astralisMerge(
      "astralis:transition-opacity astralis:duration-200",
      fitClass,
      roundedClass,
      isLoading && !lowResSrc && !componentPlaceholder && "astralis-image-loading",
      !aspectRatio && previewClasses,
      aspectRatio ? "astralis:absolute astralis:inset-0 astralis:h-full astralis:w-full" : placementClass,
      className,
    );
    const imageStyle = definedStyle(
      aspectRatio
        ? { ...loadingStyle, ...componentFit }
        : { ...placementStyle, ...intrinsicSize, ...loadingStyle, ...componentFit, ...style },
    );

    const Component = as as ElementType | undefined;
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
            aspectRatio || fills ? "astralis:absolute astralis:inset-0" : placementClass,
          )}
          style={aspectRatio || fills ? {} : { ...placementStyle, ...fallbackSize }}
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
    ) : Component ? (
      <Component
        {...componentRest}
        ref={attach}
        src={src}
        alt={alt}
        aria-label={ariaLabel}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        {...previewProps("img")}
        className={imageClassName}
        style={imageStyle}
      />
    ) : (
      <img
        {...domProps("img")}
        ref={attach}
        src={srcUrl}
        alt={alt}
        aria-label={ariaLabel}
        width={width}
        height={height}
        loading={loading ?? "lazy"}
        srcSet={srcset}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...previewProps("img")}
        className={imageClassName}
        style={imageStyle}
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
          <ImageLightbox src={srcUrl} alt={alt} onClose={() => setIsOpen(false)} />
        )}
      </>
    );
}) as ImageComponent & { displayName: string };
