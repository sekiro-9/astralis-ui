import { BreadcrumbRoot } from "./components/breadcrumb-root";
import { BreadcrumbItem } from "./components/breadcrumb-item";
import { BreadcrumbLink } from "./components/breadcrumb-link";

/* 1️⃣ Compound DX API */
export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
});

/* 2️⃣ Flat exports for tree-shaking — and the only spelling that survives the
      RSC boundary, where a client-reference stub carries no static properties.
      The root ships flat too, so a consumer never has to mix the two styles. */
export { BreadcrumbRoot, BreadcrumbItem, BreadcrumbLink };

export default Breadcrumb;

/* 3️⃣ Types */
export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
} from "./breadcrumb.types";
