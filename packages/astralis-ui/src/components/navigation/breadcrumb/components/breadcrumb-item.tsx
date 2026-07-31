import { astralisMerge } from "../../../../utils/astralis-merge";
import { breadcrumbItemVariants } from "../breadcrumb.styles";
import type { BreadcrumbItemProps } from "../breadcrumb.types";

/**
 * Breadcrumb.Item — one crumb. A plain `li`: the separator between crumbs is
 * drawn by the root, so an item only has to lay out its own contents (a link,
 * and optionally an icon beside it).
 */
export function BreadcrumbItem({ className = "", children, ...rest }: BreadcrumbItemProps) {
  return (
    <li className={astralisMerge(breadcrumbItemVariants(), className)} {...rest}>
      {children}
    </li>
  );
}

BreadcrumbItem.displayName = "Breadcrumb.Item";
