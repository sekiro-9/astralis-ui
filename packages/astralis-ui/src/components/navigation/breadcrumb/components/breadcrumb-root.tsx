import { Children, Fragment, isValidElement } from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { ChevronRightIcon } from "../../../icon/internal-icons";
import {
  breadcrumbListVariants,
  breadcrumbSeparatorIcon,
  breadcrumbSeparatorVariants,
  breadcrumbVariants,
} from "../breadcrumb.styles";
import type { BreadcrumbProps } from "../breadcrumb.types";

/**
 * Breadcrumb — the trail wrapper. It interleaves separators between its children
 * rather than asking each item to draw its own, so a crumb stays a plain `li`
 * and the trail can never end on a dangling glyph.
 *
 * Separators are `aria-hidden` and live outside the items: assistive tech reads
 * the list, not the punctuation between it.
 */
export function BreadcrumbRoot({
  separator,
  className = "",
  children,
  ref,
  ...rest
}: BreadcrumbProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const glyph = separator ?? <ChevronRightIcon className={breadcrumbSeparatorIcon} />;

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={astralisMerge(breadcrumbVariants(), className)}
      {...rest}
    >
      <ol className={breadcrumbListVariants()}>
        {items.map((child, index) => (
          <Fragment key={index}>
            {child}
            {index < items.length - 1 && (
              <li aria-hidden="true" className={breadcrumbSeparatorVariants()}>
                {glyph}
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

BreadcrumbRoot.displayName = "Breadcrumb";
