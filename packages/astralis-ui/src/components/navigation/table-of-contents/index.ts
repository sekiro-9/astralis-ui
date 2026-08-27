import { TableOfContents } from "./components/table-of-contents";

// 1️⃣ Named export (entries come from the `items` prop — no sub-components)
export { TableOfContents };

// 2️⃣ Type exports
export type { TableOfContentsProps, TableOfContentsItem } from "./table-of-contents.types";
