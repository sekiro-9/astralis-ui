import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from "react";

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  /** Glyph between items. @default chevron */
  separator?: ReactNode;
  children: ReactNode;
  /** React 19: ref is a regular prop — no forwardRef needed. */
  ref?: Ref<HTMLElement>;
}

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

export interface BreadcrumbItemProps extends ComponentPropsWithoutRef<"li"> {
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

export type BreadcrumbLinkProps<T extends ElementType = "a"> = {
  /** Render as a router link component (e.g. Next's `Link`). */
  as?: T;
  /** Marks the current page: renders non-interactive with `aria-current="page"`. */
  isCurrent?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;
