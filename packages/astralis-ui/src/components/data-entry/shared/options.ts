import { isValidElement, type ReactNode } from "react";

/**
 * Shared option-list machinery for the dropdown data-entry components
 * (Select, MultiSelect, Combobox): one definition of grouping, flattening,
 * searching and option ids, so their dropdowns cannot drift apart.
 */

export interface BaseOptionItem {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  /** Plain text the search matches against. Defaults to the label's text. */
  searchLabel?: string;
}

export interface BaseOptionGroup<O extends BaseOptionItem = BaseOptionItem> {
  group: string;
  options: O[];
}

export function isGroup<O extends BaseOptionItem>(opt: O | BaseOptionGroup<O>): opt is BaseOptionGroup<O> {
  return "group" in opt;
}

export function flattenOptions<O extends BaseOptionItem>(options: Array<O | BaseOptionGroup<O>>): O[] {
  return options.flatMap((o) => (isGroup(o) ? o.options : [o]));
}

/** The visible text of a React node, so a JSX label is searchable. */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

export function optionSearchText(option: BaseOptionItem): string {
  return option.searchLabel ?? nodeText(option.label);
}

/** Options whose search text contains `query`; empty groups are dropped. */
export function filterOptions<O extends BaseOptionItem>(
  options: Array<O | BaseOptionGroup<O>>,
  query: string,
): Array<O | BaseOptionGroup<O>> {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const matches = (o: O) => optionSearchText(o).toLowerCase().includes(q);
  return options.flatMap((o): Array<O | BaseOptionGroup<O>> => {
    if (!isGroup(o)) return matches(o) ? [o] : [];
    const kept = o.options.filter(matches);
    return kept.length ? [{ ...o, options: kept }] : [];
  });
}

/** Index-based, so option values with spaces or symbols still make valid ids. */
export function optionId(listboxId: string, index: number): string {
  return `${listboxId}-option-${index}`;
}

/** Active/disabled paint for an option row (accent channel aware). */
export function optionRowClasses(active: boolean, disabled: boolean): string {
  if (disabled) return "astralis:text-label-subtle astralis:cursor-not-allowed astralis:opacity-moderate";
  return active ? "astralis:bg-accent-subtle astralis:text-accent-label" : "astralis:text-label-base astralis:hover:bg-surface-subtle";
}
