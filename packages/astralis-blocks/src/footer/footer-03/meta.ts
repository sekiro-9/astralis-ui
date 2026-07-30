import type { BlockMeta } from "../../registry";

export default {
  id: "footer-03",
  category: "footer",
  name: "Inverted footer with four columns",
  description:
    "The column layout inverted to close a page: brand block plus four link columns on the inverted surface, with opacity carrying the secondary tier since there is no inverted-muted token. Link hover moves to the underline, which reads on any fill.",
  tags: ["four-columns", "inverted-surface", "brand-block", "social-row", "underline-hover"],
} satisfies BlockMeta;
