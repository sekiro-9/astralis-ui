"use client";

// "use client" is load-bearing, not stylistic: this renders inside MDX (a
// Server Component), and compound statics like `Table.Header` are undefined when
// `Table` crosses the RSC boundary as a client-reference stub. As a client
// component it gets the real module, so the compound API resolves.
import { Code, Table, Text } from "astralis-ui";

/**
 * Optional playground control for a prop. Omit it and the control is derived
 * from `type` (see lib/playground/controls.ts) — this exists only for the rows
 * derivation can't read, like `colorScheme`, whose `type` is deliberately the
 * prose "all 15 schemes" rather than fifteen quoted literals in a table cell.
 *
 * `omit` documents a prop in the table while keeping it out of the panel.
 *
 * Kept here beside PropRow rather than in the playground lib so the row shape
 * has one home and there's no import cycle. NOTE: docs-markdown.ts evaluates
 * these modules with `new Function` and no module system, so any identifier
 * used here must be registered in its PROP_ROW_SCOPE.
 */
export type PropControl =
  | { kind: "chips"; options: readonly string[] }
  | { kind: "select"; options: readonly string[] }
  | { kind: "switch" }
  | { kind: "text" }
  | { kind: "number" }
  | { kind: "omit" };

export interface PropRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
  control?: PropControl;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    /* Table brings its own overflow-x wrapper and, on `outline`, the rounded
       border — so the scroll container this used to hand-roll is gone. */
    <Table variant="outline" className="docs-scroll my-6">
      <Table.Header>
        <Table.Row>
          <Table.Head>Prop</Table.Head>
          <Table.Head>Type</Table.Head>
          <Table.Head>Default</Table.Head>
          <Table.Head>Description</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.prop} className="align-top">
            <Table.Cell>
              {/* The accent tint has no Box token (bg/color are surface+label
                  only), so it stays a prefixed class override. */}
              <Code className="astralis:bg-accent-subtle astralis:text-accent-label">{row.prop}</Code>
            </Table.Cell>
            {/* bg="transparent" + color: Box style props, so the unchipped
                look is expressed in tokens rather than an override class. */}
            <Table.Cell className="max-w-60">
              <Code bg="transparent" color="muted">
                {row.type}
              </Code>
            </Table.Cell>
            <Table.Cell>
              {row.default ? (
                <Code bg="transparent" color="muted">
                  {row.default}
                </Code>
              ) : (
                <Text as="span" color="subtle">
                  —
                </Text>
              )}
            </Table.Cell>
            <Table.Cell className="min-w-56 leading-relaxed astralis:text-label-muted">
              {row.description}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
