"use client";

import { splitPlacement } from "../../../../utils/placement";
import { useCallback, useMemo } from "react";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { PaginationContext } from "../pagination.context";
import type { PaginationProps } from "../pagination.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";

export function PaginationRoot({
  page: controlledPage,
  defaultPage = 1,
  totalPages,
  count,
  pageSize = 10,
  onPageChange,
  variant = "solid",
  size = "md",
  rounded = "md",
  colorScheme = "brand",
  disabled = false,
  className = "",
  children,
  ...rest
}: PaginationProps) {
  const { placementClass, rest: domProps } = splitPlacement(rest);

  // Pages come from `totalPages`, or are derived from `count` + `pageSize`.
  const resolvedTotal = Math.max(1, totalPages ?? Math.ceil((count ?? 0) / pageSize));

  const [storedPage, setStoredPage] = useControllableState({ value: controlledPage, defaultValue: defaultPage, onChange: onPageChange });
  // Clamped on read, so a shrinking `totalPages` never shows "page 10 of 3".
  const page = Math.min(Math.max(1, storedPage), resolvedTotal);

  const setPage = useCallback(
    (next: number) => {
      if (disabled) return;
      const clamped = Math.min(Math.max(1, next), resolvedTotal);
      if (clamped !== storedPage) setStoredPage(clamped);
    },
    [storedPage, resolvedTotal, setStoredPage, disabled],
  );

  const ctx = useMemo(
    () => ({ page, totalPages: resolvedTotal, setPage, count, pageSize, variant, size, rounded, disabled }),
    [page, resolvedTotal, setPage, count, pageSize, variant, size, rounded, disabled],
  );

  return (
    <PaginationContext.Provider value={ctx}>
      <nav
        aria-label="Pagination"
        className={astralisMerge("astralis:flex astralis:justify-center", accentClass(colorScheme), placementClass, className)}
        {...domProps}
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  );
}

PaginationRoot.displayName = "Pagination";
