import type { ImageAspectRatio, ImageObjectFit, ImageRounded } from "../image.types";

export const ASPECT_RATIO_MAP: Record<ImageAspectRatio, string> = {
  square: "1 / 1",
  video: "16 / 9",
  portrait: "3 / 4",
  wide: "21 / 9",
} as const;

export const ROUNDED_MAP: Record<ImageRounded, string> = {
  none: "astralis:rounded-none",
  sm: "astralis:rounded-sm",
  md: "astralis:rounded-md",
  lg: "astralis:rounded-lg",
  xl: "astralis:rounded-xl",
  "2xl": "astralis:rounded-2xl",
  "3xl": "astralis:rounded-3xl",
  full: "astralis:rounded-full",
};

export const FIT_MAP: Record<ImageObjectFit, string> = {
  contain: "astralis:object-contain",
  cover: "astralis:object-cover",
  fill: "astralis:object-fill",
  none: "astralis:object-none",
  "scale-down": "astralis:object-scale-down",
};

/** How a low-resolution placeholder URL is laid out behind the image, matched to its objectFit. */
export const PLACEHOLDER_SIZE_MAP: Record<ImageObjectFit, string> = {
  contain: "contain",
  cover: "cover",
  fill: "100% 100%",
  none: "cover",
  "scale-down": "contain",
};
