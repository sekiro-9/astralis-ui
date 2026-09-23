/** Issue snapshots, format astralis-snapshot/1. Pure: runs in the browser and in Node. */

export const SNAPSHOT_FORMAT: "astralis-snapshot/1";
export const MAX_SNAPSHOT_BYTES: number;
export const LIMITS: {
  nodes: number;
  depth: number;
  findings: number;
  console: number;
  consoleMessage: number;
  text: number;
  title: number;
  body: number;
};
export const ISSUES_ORIGIN: string;
export const DRAFTS_PATH: string;

export type ClientTier = "none" | "leaf" | "required";
export type PropValue = string | number | boolean | { [key: string]: PropValue };

export interface ComponentNode {
  /** Public name, e.g. "Card" or "Card.Body". */
  component: string;
  /** Spec-described configuration props only. */
  props: Record<string, PropValue>;
  client?: ClientTier | null;
  /** Components it renders through onto the same element (internal composition). */
  renders?: string[];
  children?: TreeNode[];
}
export type TreeNode = ComponentNode | { text: string } | { redacted: true; length: number };

export interface Snapshot {
  format: "astralis-snapshot/1";
  source: "devtools" | "cli";
  library: { name: "astralis-ui"; version: string; specVersion: number; specSha256: string };
  environment: {
    framework: { name: "next" | "vite" | null; version: string | null };
    react: string | null;
    browser: string | null;
    viewport: { width: number; height: number } | null;
    colorMode: "light" | "dark" | null;
  };
  route: string | null;
  tree: ComponentNode[];
  findings?: { code: string; file: string; line: number; column: number; message: string }[];
  console?: string[];
  screenshot?: string;
  description: { title: string; happened?: string; expected?: string };
}

export function specEntry(spec: unknown, name: string): { key: string; entry: any } | null;
export function contentOf(spec: unknown, name: string): string | null;
export function clientTier(spec: unknown, name: string): ClientTier | null;
export function describedProps(spec: unknown, name: string): Set<string> | null;
export function isConfigurationProp(key: string): boolean;
export function narrowProps(spec: unknown, name: string, props?: Record<string, unknown>): Record<string, PropValue>;
/** Props narrowed and client tiers read from the spec, for every component in a tree. */
export function narrowTree(spec: unknown, nodes: unknown): TreeNode[];
export function redactedText(text: string): { redacted: true; length: number };
export function keptText(text: string): { text: string };
export function cleanRoute(route: string | null | undefined): string | null;
export function cleanConsoleMessage(message: unknown, origin?: string): string;
/** Problems with a snapshot, or an empty list when it is valid. */
export function checkSnapshot(value: unknown): string[];
/** The snapshot's tree as a minimal repro.tsx. */
export function toRepro(snapshot: Snapshot): string;
/** Post a valid snapshot as a draft; resolves to the draft's page URL. */
export function submitDraft(
  snapshot: Snapshot,
  options?: { origin?: string; fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<string>;
