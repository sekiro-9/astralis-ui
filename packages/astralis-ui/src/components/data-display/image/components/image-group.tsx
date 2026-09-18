"use client";

import { useState } from "react";
import { FIT_MAP, ROUNDED_MAP } from "./image.constants";
import { ImageLightbox } from "./image-lightbox";
import { astralisMerge } from "../../../../utils/astralis-merge";
import type { ImageGroupProps } from "../image.types";

const GAP_MAP = {
  sm: "astralis:gap-2",
  md: "astralis:gap-3",
  lg: "astralis:gap-4",
};

const COL_MAP: Record<number, string> = {
  2: "astralis:grid-cols-2",
  3: "astralis:grid-cols-3",
  4: "astralis:grid-cols-4",
};

export function ImageGroup({
  items,
  columns = 3,
  gap = "md",
  rounded = "md",
  objectFit = "cover",
  className = "",
  style,
  ...rest
}: ImageGroupProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const current = previewIndex !== null ? items[previewIndex] : undefined;

  return (
    <>
      <div className={astralisMerge("astralis:grid", COL_MAP[columns], GAP_MAP[gap], className)} style={style} {...rest}>
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setPreviewIndex(index)}
            className={astralisMerge(
              "astralis:block astralis:w-full astralis:overflow-hidden astralis:cursor-zoom-in astralis:aspect-square astralis:outline-none",
              "astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
              ROUNDED_MAP[rounded],
            )}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={astralisMerge(
                "astralis:h-full astralis:w-full astralis:transition-transform astralis:duration-200 astralis:hover:scale-105",
                FIT_MAP[objectFit],
              )}
            />
          </button>
        ))}
      </div>

      {previewIndex !== null && current && (
        <ImageLightbox
          src={current.src}
          alt={current.alt}
          position={items.length > 1 ? `Image ${previewIndex + 1} of ${items.length}` : undefined}
          onClose={() => setPreviewIndex(null)}
          hasPrev={previewIndex > 0}
          hasNext={previewIndex < items.length - 1}
          onPrev={() => setPreviewIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setPreviewIndex((i) => Math.min(items.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}

ImageGroup.displayName = "ImageGroup";
