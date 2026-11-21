import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-display/image/image.types.ts */
export const imageProps: PropRow[] = [
  {
    prop: "src / alt",
    type: "string",
    description: "Source and alternative text. Both required.",
  },
  {
    prop: "aspectRatio",
    type: `"square" | "video" | "portrait" | "wide" | CSS ratio`,
    description: `Locks the frame to 1/1, 16/9, 3/4, 21/9, or any CSS ratio such as "4/3".`,
  },
  {
    prop: "objectFit",
    type: `"cover" | "contain" | "fill" | "none" | "scale-down"`,
    default: `"cover"`,
    description: "How the image fills its frame.",
  },
  {
    prop: "rounded",
    type: `"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"`,
    default: `"none"`,
    description: "Corner radius.",
  },
  {
    prop: "width / height",
    type: "number | string",
    description:
      "The img element's intrinsic size. On their own they reserve the box before the image loads; with a w or h prop, that prop sizes the image and these only give its aspect ratio.",
  },
  {
    prop: "loading",
    type: `"lazy" | "eager"`,
    default: `"lazy"`,
    description: "Native lazy loading.",
  },
  {
    prop: "placeholder",
    type: `"blur" | "empty" | URL`,
    default: `"empty"`,
    description:
      "What the frame shows while the image loads: a pulsing muted surface with a small image glyph (\"empty\"; \"blur\" is another name for it), or a low-resolution image URL drawn behind the picture. The real src is always in the server HTML.",
  },
  {
    prop: "srcset / sizes",
    type: "string",
    description: "Responsive image sources, passed to the img element.",
  },
  {
    prop: "fallback",
    type: "ReactNode",
    default: "icon",
    description: "Rendered when the image fails to load, or when src is empty.",
  },
  {
    prop: "caption",
    type: "ReactNode",
    description: "Wraps the image in a figure with this figcaption.",
  },
  {
    prop: "preview",
    type: "boolean",
    default: "false",
    description: "Opens a lightbox with zoom and rotate on click.",
  },
  {
    prop: "onLoad / onError",
    type: "() => void",
    description: "Fire when the image loads or fails.",
  },
  {
    prop: "ariaLabel",
    type: "string",
    description: "aria-label for the img element.",
  },
];

export const imageGroupProps: PropRow[] = [
  {
    prop: "items",
    type: "{ src, alt, caption? }[]",
    description: "The gallery images. Required.",
  },
  {
    prop: "columns",
    type: "2 | 3 | 4",
    default: "3",
    description: "Grid columns.",
  },
  {
    prop: "gap",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Space between images.",
  },
  {
    prop: "rounded",
    type: `"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"`,
    default: `"md"`,
    description: "Corner radius of every image.",
  },
  {
    prop: "objectFit",
    type: `"cover" | "contain" | "fill" | "none" | "scale-down"`,
    default: `"cover"`,
    description: "How every image fills its cell.",
  },
];
