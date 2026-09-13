import type { BlockMeta } from "../../registry";

export default {
  id: "dashboard-04",
  category: "dashboard",
  name: "Orders table with status tabs",
  description:
    "A page's worth of dashboard content rather than a shell: a title with its actions, tabs that filter orders by status with a count on each, and a table of customer, date, status and amount. Tabs and Table carry the behaviour, so there is no client state.",
  tags: ["table", "tabs", "server-safe", "orders", "status-filter"],
} satisfies BlockMeta;
