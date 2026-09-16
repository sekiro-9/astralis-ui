import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the textarea component's types in astralis-ui. */
export const textareaProps: PropRow[] = [
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Text and padding scale.",
  },
  {
    prop: "variant",
    type: `"outline" | "filled" | "underline" | "unstyled"`,
    default: `"outline"`,
    description: "Visual style.",
  },
  {
    prop: "rows",
    type: `number`,
    default: `4`,
    description: "Initial visible lines.",
  },
  {
    prop: "autoGrow",
    type: "boolean",
    default: "false",
    description:
      "Grows with its content instead of scrolling, using CSS field-sizing with no JavaScript. rows becomes the minimum height.",
  },
  {
    prop: "showCount",
    type: `boolean`,
    default: `false`,
    description: "Character counter (pairs with `maxLength`).",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `from [Field](/docs/components/field)`,
    description: "State plumbing.",
  },
];
