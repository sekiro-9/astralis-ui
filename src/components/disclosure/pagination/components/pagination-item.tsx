import type { PaginationItemProps } from "../pagination.types";
import { usePagination } from "../pagination.context";

export function PaginationItem({
  page,
  children,
}: PaginationItemProps) {
  const { page: activePage, setPage } = usePagination();
  const active = page === activePage;

  return (
    <li>
      <button
        aria-current={active ? "page" : undefined}
        data-state={active ? "active" : "inactive"}
        onClick={() => setPage(page)}
        className={[
          "astralis-h-8 astralis-min-w-8 astralis-px-2",
          "astralis-rounded-md astralis-text-sm astralis-font-medium",
          "astralis-transition-colors",
          active
            ? "astralis-bg-primary astralis-text-white"
            : "astralis-text-gray-600 hover:astralis-bg-gray-100",
        ].join(" ")}
      >
        {children}
      </button>
    </li>
  );
}
