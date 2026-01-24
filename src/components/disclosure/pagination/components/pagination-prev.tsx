import type { PaginationControlProps } from "../pagination.types";
import { usePagination } from "../pagination.context";

export function PaginationPrev({
  children = "Prev",
}: PaginationControlProps) {
  const { page, setPage } = usePagination();

  return (
    <li>
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="astralis-h-8 astralis-px-3 astralis-rounded-md astralis-text-sm astralis-text-gray-600 disabled:astralis-opacity-50"
      >
        {children}
      </button>
    </li>
  );
}
