import type { PlacementProps } from "../../../utils/placement";
import type { PolymorphicRef } from "../../../types";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
  SyntheticEvent,
} from "react";

export type ImageObjectFit =
  | "contain"
  | "cover"
  | "fill"
  | "none"
  | "scale-down";
export type ImageRounded =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full";
export type ImageAspectRatio =
  | "square"
  | "video"
  | "portrait"
  | "wide"
  | (string & {});

// `width`/`height` here are the img element's intrinsic-size attributes —
// the native meaning keeps the names, so Image opts out of those two aliases.
/** Props Image owns whatever renders the picture. */
export interface ImageOwnProps extends Omit<PlacementProps, "width" | "height"> {
  alt: string;
  className?: string;
  style?: CSSProperties;
  objectFit?: ImageObjectFit;
  rounded?: ImageRounded;
  /** Fixed aspect-ratio wrapper: "square"=1/1, "video"=16/9, "portrait"=3/4, "wide"=21/9, or any CSS ratio e.g. "4/3" */
  aspectRatio?: ImageAspectRatio;
  /** Fallback element shown when the image fails to load */
  fallback?: ReactNode;
  /** Short text shown below the image in a <figcaption> */
  caption?: ReactNode;
  /** Enables click-to-preview lightbox */
  preview?: boolean;
  ariaLabel?: string;
}

/** Image rendering its own img element. */
export interface ImageProps extends ImageOwnProps {
  src: string;
  /**
   * The img element's intrinsic width. With `height`, it reserves the box
   * before the image loads. A `w` or `h` prop takes over the sizing; the two
   * attributes then only give the aspect ratio.
   */
  width?: number | string;
  /** The img element's intrinsic height. See `width`. */
  height?: number | string;
  /** @default "lazy" */
  loading?: "eager" | "lazy";
  srcset?: string;
  sizes?: string;
  /**
   * What the frame shows while the image loads: "empty" a pulsing muted
   * surface with a small image glyph ("blur" is kept as another name for
   * it), or a URL of a low-resolution version drawn behind the image.
   * With `as`, `placeholder` is that component's own (Next's "blur" with
   * `blurDataURL`), and the pulsing surface shows only while it is unset or "empty".
   * @default "empty"
   */
  placeholder?: "blur" | "empty" | string;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Image rendering through a framework's image component (`as={NextImage}`),
 * which then does the resizing and loading. Everything Image does not own
 * follows that component's props, `src`, `width`, `placeholder` and `loading`
 * included, and is passed to it.
 */
export type ImageAsProps<C extends ElementType> = ImageOwnProps & {
  /** An image component to render through, such as Next's `Image`. The library never imports one. */
  as: C;
  ref?: PolymorphicRef<C>;
} & Omit<ComponentPropsWithoutRef<C>, keyof ImageOwnProps | "as">;

/**
 * The plain signature comes first: tools that read a component's props from
 * its first call signature (the system spec) then see Image's own img props.
 */
export interface ImageComponent {
  (props: ImageProps & { ref?: Ref<HTMLImageElement> }): ReactElement;
  <C extends ElementType>(props: ImageAsProps<C>): ReactElement;
}

export interface ImageGroupItem {
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface ImageGroupProps extends ComponentPropsWithoutRef<"div"> {
  items: ImageGroupItem[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  rounded?: ImageRounded;
  objectFit?: ImageObjectFit;
  className?: string;
  style?: CSSProperties;
}
