import type { BlockMeta } from "../../registry";

export default {
  id: "dashboard-03",
  category: "dashboard",
  name: "Inverted sidebar with a two-tier header",
  description:
    "The shell with an inverted sidebar and a two-tier header: a title row with actions above a row of section tabs, the active tab marked by its own bottom border. The content region is empty scaffolding. Below lg the sidebar becomes an overlay drawer.",
  tags: ["sidebar", "inverted", "two-tier-header", "section-tabs", "mobile-drawer"],
} satisfies BlockMeta;
