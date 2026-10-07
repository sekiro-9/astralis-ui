"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Icon, Input, InputGroup, NativeSelect } from "astralis-ui";

import { filtersHref, type IssueFilters, type Label } from "@/lib/issues/github";

/** Search and a label filter; each change is a new URL, so a filtered list can be shared. */
export function FilterBar({ filters, labels }: { filters: IssueFilters; labels: Label[] }) {
  const router = useRouter();
  const go = (patch: Partial<IssueFilters>) => router.push(filtersHref({ ...filters, page: 1, ...patch }), { scroll: false });

  return (
    <div className="flex flex-wrap gap-2">
      <form
        role="search"
        className="flex min-w-0 flex-1 gap-2 sm:max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
          go({ q: q || null });
        }}
      >
        <InputGroup prefix={<Icon as={Search} size="xs" />} className="flex-1">
          <Input size="sm" name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Search issues, or a component like Card" aria-label="Search issues" />
        </InputGroup>
        <Button type="submit" size="sm" variant="outline" colorScheme="gray">
          Search
        </Button>
      </form>
      <NativeSelect size="sm" aria-label="Label" value={filters.label ?? ""} onChange={(e) => go({ label: e.target.value || null })} className="w-48">
        <option value="">All labels</option>
        {labels.map((label) => (
          <option key={label.name} value={label.name}>
            {label.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
