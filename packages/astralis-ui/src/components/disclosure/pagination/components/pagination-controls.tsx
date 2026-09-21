"use client";

import type { ReactNode } from "react";
import type { PaginationControlProps } from "../pagination.types";
import { usePagination } from "../pagination.context";
import { paginationControlVariants, controlIconSize } from "../pagination.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import Icon from "../../../icon/icon";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

interface ControlButtonProps extends PaginationControlProps {
  label: string;
  disabled: boolean;
  onActivate: () => void;
  defaultIcon: ReactNode;
}

const ControlButton = identify("Pagination.Control", function ControlButton({ icon, className = "", label, disabled, onActivate, defaultIcon, ...rest }: ControlButtonProps) {
  const { size, rounded } = usePagination();
  return (
    <li {...rest}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onActivate}
        className={astralisMerge(paginationControlVariants({ size, rounded }), className)}
      >
        {icon ?? defaultIcon}
      </button>
    </li>
  );
});

export const PaginationPrev = identify("Pagination.Prev", function PaginationPrev(props: PaginationControlProps) {
  const { page, setPage, size, disabled } = usePagination();
  return (
    <ControlButton
      {...props}
      label="Previous page"
      disabled={disabled || page <= 1}
      onActivate={() => setPage(page - 1)}
      defaultIcon={<Icon size={controlIconSize[size]}><ChevronLeftIcon /></Icon>}
    />
  );
});

export const PaginationNext = identify("Pagination.Next", function PaginationNext(props: PaginationControlProps) {
  const { page, totalPages, setPage, size, disabled } = usePagination();
  return (
    <ControlButton
      {...props}
      label="Next page"
      disabled={disabled || page >= totalPages}
      onActivate={() => setPage(page + 1)}
      defaultIcon={<Icon size={controlIconSize[size]}><ChevronRightIcon /></Icon>}
    />
  );
});

export const PaginationFirst = identify("Pagination.First", function PaginationFirst(props: PaginationControlProps) {
  const { page, setPage, size, disabled } = usePagination();
  return (
    <ControlButton
      {...props}
      label="First page"
      disabled={disabled || page <= 1}
      onActivate={() => setPage(1)}
      defaultIcon={<Icon size={controlIconSize[size]}><ChevronsLeftIcon /></Icon>}
    />
  );
});

export const PaginationLast = identify("Pagination.Last", function PaginationLast(props: PaginationControlProps) {
  const { page, totalPages, setPage, size, disabled } = usePagination();
  return (
    <ControlButton
      {...props}
      label="Last page"
      disabled={disabled || page >= totalPages}
      onActivate={() => setPage(totalPages)}
      defaultIcon={<Icon size={controlIconSize[size]}><ChevronsRightIcon /></Icon>}
    />
  );
});
