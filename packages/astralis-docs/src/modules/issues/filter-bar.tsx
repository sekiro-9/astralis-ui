"use client";

import { useRouter } from "next/navigation";
import { NativeSelect } from "astralis-ui";

import { filtersHref, type IssueFilters } from "@/lib/issues/filters";
import { SEVERITIES, SEVERITY_LABELS } from "@/lib/issues/model";

interface FilterBarProps {
  filters: IssueFilters;
  components: string[];
  rules: string[];
}

/** Component, rule and severity filters; each change is a new URL, so a filtered list can be shared. */
export function FilterBar({ filters, components, rules }: FilterBarProps) {
  const router = useRouter();
  const set = (patch: Partial<IssueFilters>) => router.push(filtersHref({ ...filters, ...patch }), { scroll: false });

  return (
    <div className="flex flex-wrap gap-2">
      <NativeSelect
        size="sm"
        aria-label="Component"
        value={filters.component ?? ""}
        onChange={(e) => set({ component: e.target.value || null })}
        className="w-44"
      >
        <option value="">All components</option>
        {components.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        size="sm"
        aria-label="Rule"
        value={filters.rule ?? ""}
        onChange={(e) => set({ rule: e.target.value || null })}
        className="w-52"
      >
        <option value="">All rules</option>
        {rules.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        size="sm"
        aria-label="Severity"
        value={filters.severity ?? ""}
        onChange={(e) => set({ severity: (e.target.value || null) as IssueFilters["severity"] })}
        className="w-40"
      >
        <option value="">Any severity</option>
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {SEVERITY_LABELS[s]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
