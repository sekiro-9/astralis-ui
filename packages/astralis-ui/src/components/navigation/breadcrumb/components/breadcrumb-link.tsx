import type { ElementType } from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { breadcrumbCurrentVariants, breadcrumbLinkVariants } from "../breadcrumb.styles";
import type { BreadcrumbLinkProps } from "../breadcrumb.types";

/**
 * Breadcrumb.Link — a navigable crumb, or the current page when `isCurrent`.
 *
 * The current crumb renders a `span`, not a link: it points at the page you are
 * already on, so it gets `aria-current="page"` and loses the affordance rather
 * than staying clickable and going nowhere.
 *
 * `as` takes a router link (Next's `Link`, a framework `NavLink`) so the trail
 * navigates client-side without this component knowing about any router.
 */
export function BreadcrumbLink<T extends ElementType = "a">({
  as,
  isCurrent = false,
  className = "",
  children,
  ...rest
}: BreadcrumbLinkProps<T>) {
  if (isCurrent) {
    return (
      <span aria-current="page" className={astralisMerge(breadcrumbCurrentVariants(), className)}>
        {children}
      </span>
    );
  }

  const Element = (as || "a") as ElementType;

  return (
    <Element className={astralisMerge(breadcrumbLinkVariants(), className)} {...rest}>
      {children}
    </Element>
  );
}

BreadcrumbLink.displayName = "Breadcrumb.Link";
