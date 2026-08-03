import type { PropRow } from "@/modules/docs/props-table";
import { unquote, UNSET } from "./controls";

/**
 * Turning playground state back into JSX you can paste.
 *
 * The rule that matters is **omit anything still at its default**. Emit every
 * prop and the output is noise nobody copies; omit one that *isn't* actually
 * default and the pasted code renders differently from the preview, which is
 * worse than noise. Hence the `rows` argument — defaults come from the same
 * documented data the controls were derived from.
 *
 * Pure and React-free on purpose.
 */

interface GenerateOptions {
  /** JSX tag name, e.g. "Badge". */
  tag: string;
  /** Current control state (plus any baseProps), keyed by prop name. */
  props: Record<string, unknown>;
  /** The documented rows, for default comparison. */
  rows: readonly PropRow[];
  /** Children source — plain text, or a fixture's JSX, which may be multi-line. */
  children?: string;
  /**
   * Names the children need beyond `tag`, so a fixture's code still pastes and
   * runs. Compound parts (`Alert.Title`) need nothing extra — they come in on
   * the root — but a ButtonGroup full of `Button`s does.
   */
  imports?: readonly string[];
  /** Package the import line points at. */
  from?: string;
  /** Wrap onto one prop per line past this width. */
  maxWidth?: number;
}

/**
 * Strip the shared indentation off a fixture written as a template literal, so
 * it can be re-indented to sit under its parent tag. Blank lines are ignored
 * when measuring, otherwise one stray empty line would flatten everything.
 */
export function dedent(source: string): string {
  const lines = source.replace(/\t/g, "  ").split("\n");
  const indents = lines
    .filter((line) => line.trim() !== "")
    .map((line) => line.match(/^ */)![0].length);
  const common = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((line) => line.slice(common))
    .join("\n")
    .trim();
}

const DEFAULT_MAX_WIDTH = 72;

/**
 * A JS literal for a prop that isn't a primitive — `options` arrays and the
 * like. JSON.stringify quotes every key, which is not how anyone writes JSX,
 * so identifier keys are unquoted and short collections stay on one line.
 */
export function jsLiteral(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.map(jsLiteral);
    const inline = `[${items.join(", ")}]`;
    if (inline.length <= 48 && !inline.includes("\n")) return inline;
    return `[\n${items.map((item) => `  ${item}`).join(",\n")},\n]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, val]) =>
        `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${jsLiteral(val)}`,
    );
    return `{ ${entries.join(", ")} }`;
  }
  return JSON.stringify(value);
}

/** Is this value the prop's documented default, and therefore droppable? */
function isDefault(row: PropRow | undefined, value: unknown): boolean {
  if (!row) return false;
  const documented = unquote(row.default);
  if (documented === undefined) {
    // No documented default: booleans default to false, so only `true` is worth
    // emitting. Strings and numbers have no safe assumption — always emit.
    return typeof value === "boolean" ? value === false : false;
  }
  // Objects and arrays have no documented default worth comparing against.
  if (value !== null && typeof value === "object") return false;
  return String(value) === documented;
}

/** `variant="outline"`, `max={100}`, `options={[…]}`, or a bare `disabled`. */
function attribute(prop: string, value: unknown): string | null {
  if (typeof value === "boolean") return value ? prop : null;
  // Numbers take braces — `max="100"` would pass the string "100".
  if (typeof value === "number") return `${prop}={${value}}`;
  if (typeof value === "string") return `${prop}="${value}"`;
  return `${prop}={${jsLiteral(value)}}`;
}

export function generateJsx({
  tag,
  props,
  rows,
  children,
  imports,
  from = "astralis-ui",
  maxWidth = DEFAULT_MAX_WIDTH,
}: GenerateOptions): string {
  const byName = new Map(rows.map((row) => [row.prop, row]));

  const attrs: string[] = [];
  for (const [prop, value] of Object.entries(props)) {
    // UNSET, and an emptied text box: the reader chose nothing, so say nothing.
    // `placeholder=""` is not a configuration, it is noise.
    if (value === UNSET) continue;
    if (isDefault(byName.get(prop), value)) continue;
    const attr = attribute(prop, value);
    if (attr) attrs.push(attr);
  }

  const body = children ? dedent(children) : "";

  // `Alert.Title` needs only `Alert`, so drop anything dotted and de-duplicate.
  const names = [...new Set([tag, ...(imports ?? [])].map((n) => n.split(".")[0]))].sort();
  const importLine = `import { ${names.join(", ")} } from "${from}";`;

  /** Indent every line, so a serialized `options={[…]}` nests properly too. */
  const indent = (text: string) =>
    text
      .split("\n")
      .map((line) => (line.trim() === "" ? "" : `  ${line}`))
      .join("\n");

  const oneLine = attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
  const closing = `</${tag}>`;

  // An attribute that spans lines forces block form, like a multi-line fixture.
  const wideAttrs = attrs.some((attr) => attr.includes("\n"));

  // Self-closing when there are no children — `<Spinner size="lg" />`.
  if (!body) {
    const selfClosed = attrs.length ? `<${tag} ${attrs.join(" ")} />` : `<${tag} />`;
    const element =
      !wideAttrs && selfClosed.length <= maxWidth
        ? selfClosed
        : [`<${tag}`, ...attrs.map(indent), "/>"].join("\n");
    return `${importLine}\n\n${element}\n`;
  }

  // A fixture spanning lines can never sit inline, however short it measures.
  const multiline = body.includes("\n") || wideAttrs;
  const inline = `${oneLine}${body}${closing}`;

  const element =
    !multiline && inline.length <= maxWidth
      ? inline
      : attrs.length
        ? [`<${tag}`, ...attrs.map(indent), `>`, indent(body), closing].join("\n")
        : [oneLine, indent(body), closing].join("\n");

  return `${importLine}\n\n${element}\n`;
}
