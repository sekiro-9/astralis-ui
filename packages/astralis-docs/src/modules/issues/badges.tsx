import { Badge } from "astralis-ui";

import {
  type IssueStatus,
  type Severity,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/lib/issues/model";

type Scheme = "blue" | "purple" | "teal" | "orange" | "yellow" | "green" | "gray" | "red";

const STATUS_SCHEMES: Record<IssueStatus, Scheme> = {
  new: "blue",
  triaged: "purple",
  accepted: "teal",
  in_progress: "orange",
  fix_in_review: "yellow",
  fixed: "green",
  released: "green",
  declined: "gray",
  duplicate: "gray",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge variant={status === "released" ? "solid" : "subtle"} colorScheme={STATUS_SCHEMES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const SEVERITY_SCHEMES: Record<Severity, Scheme> = {
  critical: "red",
  high: "orange",
  normal: "gray",
  low: "gray",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant={severity === "critical" ? "solid" : "outline"} colorScheme={SEVERITY_SCHEMES[severity]}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}
