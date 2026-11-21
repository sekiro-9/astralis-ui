// Server Component since 0.7.2: Table is a true server module now, so
// compound statics like `Table.Header` resolve during server render. The
// "use client" workaround this file used to carry is gone, and the props
// tables ship zero JS.
import NextLink from "next/link";
import { Code, Link, Table, Text } from "astralis-ui";
import { PLACEMENT_RULE_HREF, isPlacementOnly, placementRow } from "./placement-only";

export interface PropRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
}

// The accent tint has no Box token (bg/color are surface+label only), so it
// rides the style hatch on the accent variables.
const propChipStyle = {
  background: "var(--astralis-color-accent-subtle)",
  color: "var(--astralis-color-accent-label)",
};

function PlacementRow() {
  return (
    <Table.Row className="align-top">
      <Table.Cell>
        <Code style={propChipStyle}>{placementRow.prop}</Code>
      </Table.Cell>
      <Table.Cell className="max-w-60">
        <Code bg="transparent" color="muted">
          {placementRow.type}
        </Code>
      </Table.Cell>
      <Table.Cell>
        <Text as="span" color="subtle">
          None
        </Text>
      </Table.Cell>
      <Table.Cell className="min-w-56 leading-relaxed" style={{ color: "var(--astralis-color-label-muted)" }}>
        {placementRow.description}{" "}
        <Link as={NextLink} href={PLACEMENT_RULE_HREF}>
          Paint and placement
        </Link>
      </Table.Cell>
    </Table.Row>
  );
}

/**
 * `of` names the component the rows document. For a recipe component it adds
 * the shared placement row, so the rule appears on every such page.
 */
export function PropsTable({ rows, of }: { rows: PropRow[]; of?: string }) {
  return (
    /* Table brings its own overflow-x wrapper and, on `outline`, the rounded
       border, so the scroll container this used to hand-roll is gone. */
    <Table variant="outline" my="6" className="docs-scroll">
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
          // Table.Row and Table.Cell take no style props: alignment and cell widths stay classes.
          <Table.Row key={row.prop} className="align-top">
            <Table.Cell>
              <Code style={propChipStyle}>{row.prop}</Code>
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
                  None
                </Text>
              )}
            </Table.Cell>
            <Table.Cell
              className="min-w-56 leading-relaxed"
              style={{ color: "var(--astralis-color-label-muted)" }}
            >
              {row.description}
            </Table.Cell>
          </Table.Row>
        ))}
        {of && isPlacementOnly(of) && <PlacementRow />}
      </Table.Body>
    </Table>
  );
}
