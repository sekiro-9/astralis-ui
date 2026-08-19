import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Table } from "./index";

/**
 * Table styling reaches the parts through CSS parent-keyed variants on the
 * root wrapper's data attributes (size always; striped/interactive/sticky as
 * presence attributes). These tests pin the attribute stamping and the part
 * classes; the selector side lives in dist/styles.css and is covered by the
 * css coverage gate.
 */
describe("Table data attributes", () => {
  it("stamps size and omits boolean attributes when off", () => {
    const { container } = render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>a</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.getAttribute("data-table-size")).toBe("md");
    expect(wrapper.hasAttribute("data-table-striped")).toBe(false);
    expect(wrapper.hasAttribute("data-table-interactive")).toBe(false);
    expect(wrapper.hasAttribute("data-table-sticky")).toBe(false);
  });

  it("stamps presence attributes when striped/interactive/stickyHeader are set", () => {
    const { container } = render(
      <Table size="sm" striped interactive stickyHeader>
        <Table.Body>
          <Table.Row>
            <Table.Cell>a</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.getAttribute("data-table-size")).toBe("sm");
    expect(wrapper.hasAttribute("data-table-striped")).toBe(true);
    expect(wrapper.hasAttribute("data-table-interactive")).toBe(true);
    expect(wrapper.hasAttribute("data-table-sticky")).toBe(true);
  });

  it("cells carry the md default and size overrides; rows carry the state variants", () => {
    const { getByText } = render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>h</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>c</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const cell = getByText("c").className;
    expect(cell).toContain("astralis:px-4"); // md default
    expect(cell).toContain("astralis:[[data-table-size=sm]_&]:px-3");
    expect(cell).toContain("astralis:[[data-table-size=lg]_&]:px-5");

    const row = getByText("c").closest("tr")!.className;
    expect(row).toContain("astralis:[[data-table-striped]_&]:even:bg-surface-subtle");
    expect(row).toContain("astralis:[[data-table-interactive]:not([data-table-striped])_&]:hover:bg-surface-subtle");

    const thead = getByText("h").closest("thead")!.className;
    expect(thead).toContain("astralis:[[data-table-sticky]_&]:sticky");
  });

  it("parts outside any root render with md defaults instead of throwing", () => {
    // The context version threw here; the CSS version degrades to md quietly,
    // matching Card's long-standing contract.
    const { getByText } = render(
      <table>
        <tbody>
          <Table.Row>
            <Table.Cell>orphan</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );
    expect(getByText("orphan").className).toContain("astralis:px-4");
  });
});
