import { createHash } from "node:crypto";
import type { Snapshot } from "astralis-cli/snapshot";

export interface Fingerprint {
  /** The reported component: the first component at the top of the tree. */
  component: string;
  /** The findings' rule codes, unique and sorted. */
  ruleCodes: string[];
  /** The library's minor version ("0.7" for 0.7.6), or the whole version if it has no minor. */
  minor: string;
  /** SHA-256 of the three, hex. Equal fingerprints mean the same problem. */
  value: string;
}

/** "0.7.6" and "0.7.6-beta.1" give "0.7"; anything unparseable is kept whole. */
export function minorVersion(version: string): string {
  const match = /^(\d+)\.(\d+)/.exec(version);
  return match ? `${match[1]}.${match[2]}` : version;
}

/**
 * The fingerprint of a snapshot (FYP report, Section 3.8.5): the component,
 * the rule codes of the findings and the library's minor version. Page text,
 * props, the route and the reporter's words are left out on purpose, so two
 * people meeting the same problem on different pages still match.
 */
export function fingerprintOf(snapshot: Pick<Snapshot, "tree" | "findings" | "library">): Fingerprint {
  const component = snapshot.tree[0]?.component ?? "unknown";
  const ruleCodes = [...new Set((snapshot.findings ?? []).map((f) => f.code))].sort();
  const minor = minorVersion(snapshot.library.version);
  const value = createHash("sha256").update(JSON.stringify([component, ruleCodes, minor])).digest("hex");
  return { component, ruleCodes, minor, value };
}
