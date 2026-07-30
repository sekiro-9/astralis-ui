import type { BlockMeta } from "../../registry";

export default {
  id: "dashboard-01",
  category: "dashboard",
  name: "Sidebar shell with grouped nav",
  description:
    "A dashboard shell: a tinted sidebar with a workspace header, grouped nav with counts and a user row, beside a sticky header carrying a breadcrumb, search and actions. The content region is empty scaffolding. Below lg the sidebar becomes an overlay drawer.",
  tags: ["sidebar", "grouped-nav", "sticky-header", "search", "mobile-drawer"],
} satisfies BlockMeta;
