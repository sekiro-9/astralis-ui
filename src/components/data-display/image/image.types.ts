export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "eager" | "lazy";
  srcset?: string;
  sizes?: string;
  placeholder?: "blur" | "empty" | string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  onLoad?: () => void;
  onError?: () => void;
  ariaLabel?: string;
}