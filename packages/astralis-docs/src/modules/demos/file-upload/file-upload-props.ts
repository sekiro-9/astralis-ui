import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/file-upload/file-upload.types.ts */
export const fileUploadProps: PropRow[] = [
  {
    prop: "accept",
    type: "string",
    description: `Native accept filter, such as "image/*,.pdf". The picker enforces it.`,
    control: { kind: "omit" },
  },
  {
    prop: "multiple",
    type: "boolean",
    default: "false",
    description: "Allow more than one file.",
  },
  {
    prop: "maxFiles",
    type: "number",
    description: "Cap on the number of kept files when multiple is set. Picks past it are rejected.",
    control: { kind: "omit" },
  },
  {
    prop: "maxSize",
    type: "number",
    description: "Per-file size cap in bytes. Larger picks are rejected.",
    control: { kind: "omit" },
  },
  {
    prop: "onFilesChange",
    type: "(files: File[]) => void",
    description: "The full kept list after every add or remove.",
  },
  {
    prop: "onReject",
    type: `(rejections: { file, reason: "size" | "count" }[]) => void`,
    description: "The picks that were refused, and why.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Locks picking and dropping.",
  },
];

export const fileUploadPartsProps: PropRow[] = [
  {
    prop: "FileUpload.Dropzone",
    type: "div props",
    description: "Drop target that also opens the picker on click, Enter or Space.",
  },
  {
    prop: "FileUpload.Trigger",
    type: "children: ReactElement",
    description: "Wraps your own element, such as a Button, to open the picker.",
  },
  {
    prop: "FileUpload.ItemGroup",
    type: "ul props",
    description: "The kept files, each with its name, size and a remove button.",
  },
];
