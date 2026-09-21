"use client";

import { usePagination } from "../pagination.context";
import { paginationEllipsisVariants } from "../pagination.styles";
import type { PaginationEllipsisProps } from "../pagination.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const PaginationEllipsis = identify("Pagination.Ellipsis", function PaginationEllipsis({ className = "", ...rest }: PaginationEllipsisProps) {
  const { size } = usePagination();
  return (
    <li aria-hidden="true" className={astralisMerge(paginationEllipsisVariants({ size }), className)} {...rest}>
      &hellip;
    </li>
  );
});
