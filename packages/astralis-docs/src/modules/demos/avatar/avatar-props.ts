import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the avatar component's types in astralis-ui. */
export const avatarProps: PropRow[] = [
  {
    prop: "src / alt",
    type: `string`,
    description: "The image, with its alt text.",
  },
  {
    prop: "name",
    type: `string`,
    description: "Drives initials and the deterministic hue.",
  },
  {
    prop: "icon",
    type: `ReactNode`,
    default: `silhouette`,
    description: "Custom fallback when no image or name.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl" | "2xl"`,
    default: `"md"`,
    description: "Diameter.",
  },
  {
    prop: "shape",
    type: `"circle" | "rounded" | "square"`,
    default: `"circle"`,
    description: "Outline shape.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `from name`,
    description: "Explicit hue override.",
  },
  {
    prop: "ring",
    type: `boolean`,
    default: `false`,
    description: "Border ring (automatic inside a Group).",
  },
];

export const avatarGroupProps: PropRow[] = [
  {
    prop: "max",
    type: "number",
    description: "How many avatars to show; the rest collapse into a +N chip.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl" | "2xl"`,
    default: `"md"`,
    description: "Applied to every avatar in the group.",
  },
  {
    prop: "spacing",
    type: "number",
    default: "-8",
    description: "Overlap between avatars, in pixels. Negative values overlap.",
  },
];

export const avatarBadgeProps: PropRow[] = [
  {
    prop: "status",
    type: `"online" | "away" | "busy" | "offline"`,
    default: `"online"`,
    description: "Preset dot color.",
  },
  {
    prop: "color",
    type: "string",
    description: "Custom dot color, overriding status.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl" | "2xl"`,
    description: "Dot size. Taken from the avatar it sits in.",
  },
];
