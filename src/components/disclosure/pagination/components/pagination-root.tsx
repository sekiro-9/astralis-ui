import { useCallback, useState } from "react";
import { PaginationContext } from "../pagination.context";
import type { PaginationProps } from "../pagination.types";

export function PaginationRoot({
  page: controlledPage,
  defaultPage = 1,
  totalPages,
  onPageChange,
  children,
}: PaginationProps) {
  const [uncontrolledPage, setUncontrolledPage] =
    useState(defaultPage);

  const page = controlledPage ?? uncontrolledPage;

  const setPage = useCallback(
    (next: number) => {
      const clamped = Math.min(
        Math.max(1, next),
        totalPages
      );

      if (controlledPage === undefined) {
        setUncontrolledPage(clamped);
      }

      onPageChange?.(clamped);
    },
    [controlledPage, totalPages, onPageChange]
  );

  return (
    <PaginationContext.Provider
      value={{ page, totalPages, setPage }}
    >
      <nav
        aria-label="Pagination"
        className="astralis-flex astralis-justify-center"
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  );
}
