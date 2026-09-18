import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Tag } from "./index";

const here = join(process.cwd(), "src/components/data-display/tag/components");

describe("Tag", () => {
  it("names the remove button after the tag and calls onClose", () => {
    const onClose = vi.fn();
    render(
      <Tag closable onClose={onClose}>
        Design
      </Tag>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("takes an explicit close label for non-text children", () => {
    render(
      <Tag closable closeLabel="Remove filter">
        <b>x</b>
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Remove filter" })).toBeInTheDocument();
  });

  it("keeps the server-rendered Tag free of event handlers: the close button is a client leaf", () => {
    const root = readFileSync(join(here, "tag-root.tsx"), "utf8");
    const leaf = readFileSync(join(here, "tag-close-button.tsx"), "utf8");
    expect(root.startsWith('"use client"')).toBe(false);
    expect(root).not.toMatch(/onClick=/);
    expect(leaf.startsWith('"use client"')).toBe(true);
  });
});

describe("Tag.Checkable", () => {
  it("toggles on its own when uncontrolled", () => {
    const onCheckedChange = vi.fn();
    render(<Tag.Checkable onCheckedChange={onCheckedChange}>Beta</Tag.Checkable>);
    const tag = screen.getByRole("checkbox", { name: "Beta" });
    fireEvent.click(tag);
    expect(tag).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(tag, { key: " " });
    expect(tag).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it("holds a controlled value and still fires the deprecated onChange", () => {
    const onChange = vi.fn();
    render(
      <Tag.Checkable checked={false} onChange={onChange}>
        Beta
      </Tag.Checkable>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
  });
});

describe("Tag.Group", () => {
  it("selects without a handler when uncontrolled, single-select by default", () => {
    render(<Tag.Group defaultValue={["S"]} options={["S", "M", "L"]} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "M" }));
    expect(screen.getByRole("checkbox", { name: "M" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: "S" })).toHaveAttribute("aria-checked", "false");
  });

  it("accumulates in multiple mode and reports through onValueChange and onChange", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Tag.Group
        multiple
        defaultValue={["React"]}
        onValueChange={onValueChange}
        onChange={onChange}
        options={[
          { label: "React", value: "React" },
          { label: "Vue", value: "Vue" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Vue" }));
    expect(onValueChange).toHaveBeenCalledWith(["React", "Vue"]);
    expect(onChange).toHaveBeenCalledWith(["React", "Vue"]);
  });
});
