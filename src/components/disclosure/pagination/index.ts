import { PaginationRoot } from "./components/pagination-root";
import { PaginationList } from "./components/pagination-list";
import { PaginationItem } from "./components/pagination-item";
import { PaginationPrev } from "./components/pagination-prev";
import { PaginationNext } from "./components/pagination-next";
import { PaginationEllipsis } from "./components/pagination-ellipsis";

/* 1️⃣ Compound API */
export const Pagination = Object.assign(PaginationRoot, {
  List: PaginationList,
  Item: PaginationItem,
  Prev: PaginationPrev,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
});

/* 2️⃣ Flat exports */
export {
  PaginationList,
  PaginationItem,
  PaginationPrev,
  PaginationNext,
  PaginationEllipsis,
};

/* 3️⃣ Types */
export type {
  PaginationProps,
  PaginationListProps,
  PaginationItemProps,
  PaginationControlProps,
} from "./pagination.types";
