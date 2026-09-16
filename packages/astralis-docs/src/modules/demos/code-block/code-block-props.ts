import type { PropRow } from "@/modules/docs/props-table";

/**
 * CodeBlock is a namespace of parts, so this table documents `CodeBlock.Root`.
 * Keep in sync with packages/astralis-ui/src/components/typography/code-block/code-block.types.ts
 */
export const codeBlockProps: PropRow[] = [
  {
    prop: "variant",
    type: `"subtle" | "solid" | "outline"`,
    default: `"subtle"`,
    description: "Container style. Every variant follows the active light or dark theme.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Font size and padding of the content.",
  },
  {
    prop: "code",
    type: "string",
    description: "The source. Code renders it when given no children, and CopyTrigger copies it.",
    control: { kind: "omit" },
  },
];

export const codeBlockPartsProps: PropRow[] = [
  {
    prop: "CodeBlock.Header",
    type: "div props",
    description: "Optional top row for Title, WindowControls and a trailing Control slot.",
  },
  {
    prop: "CodeBlock.Title",
    type: "span props",
    description: "File name or caption in the header.",
  },
  {
    prop: "CodeBlock.WindowControls",
    type: "span props",
    description: "Three decorative window dots, hidden from assistive technology.",
  },
  {
    prop: "CodeBlock.Control",
    type: "div props",
    description: "Trailing header slot, usually holding the CopyTrigger.",
  },
  {
    prop: "CodeBlock.CopyTrigger",
    type: "code?: string · children?: ReactNode | ((copied: boolean) => ReactNode)",
    description:
      "Copies the Root's code, or its own code override. A render function replaces the default copy and check glyphs.",
  },
  {
    prop: "CodeBlock.Content",
    type: "pre props",
    description: "The scrollable pre element that wraps Code.",
  },
  {
    prop: "CodeBlock.Code",
    type: "highlightedHtml?: string",
    description:
      "Renders the Root's code as plain text, or your highlighter's HTML when highlightedHtml is set.",
  },
];
