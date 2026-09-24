import { isSeverity, isStatus, type IssueStatus, type Severity } from "./model";

/**
 * The public list's filters, as they appear in its URL. `status` also takes
 * two groups: "open" (the default, what still needs work) and "contributors"
 * (accepted and open to anyone who claims it).
 */
export type StatusFilter = IssueStatus | "open" | "contributors" | "all";

export interface IssueFilters {
  status: StatusFilter;
  component: string | null;
  rule: string | null;
  severity: Severity | null;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/** A component or rule name as the list accepts it; anything else is ignored. */
const NAME = /^[A-Za-z][\w.-]{0,79}$/;

export function parseFilters(params: SearchParams): IssueFilters {
  const status = first(params.status);
  const component = first(params.component);
  const rule = first(params.rule);
  const severity = first(params.severity);
  return {
    status:
      status === "all" || status === "contributors" || isStatus(status) ? status : "open",
    component: component && NAME.test(component) ? component : null,
    rule: rule && NAME.test(rule) ? rule : null,
    severity: isSeverity(severity) ? severity : null,
  };
}

/** The list's URL for a set of filters and a page, leaving out the defaults. */
export function filtersHref(filters: IssueFilters, page = 1): string {
  const query = new URLSearchParams();
  if (filters.status !== "open") query.set("status", filters.status);
  if (filters.component) query.set("component", filters.component);
  if (filters.rule) query.set("rule", filters.rule);
  if (filters.severity) query.set("severity", filters.severity);
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `/issues?${text}` : "/issues";
}
