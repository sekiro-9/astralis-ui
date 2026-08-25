import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Collapsible } from "./index";

/** Zero-JS disclosure: state is the browser's, semantics are native. */
describe("Collapsible", () => {
  it("renders details/summary with native exclusive-group name", () => {
    const { container } = render(
      <Collapsible name="faq" defaultOpen>
        <Collapsible.Trigger>Question</Collapsible.Trigger>
        <Collapsible.Content>Answer</Collapsible.Content>
      </Collapsible>,
    );
    const details = container.querySelector("details")!;
    expect(details.getAttribute("name")).toBe("faq");
    expect(details.open).toBe(true);
    expect(details.querySelector("summary")).not.toBeNull();
  });

  it("keeps the summary a list-item (marker hidden, not display swapped) — the announcement-preserving rule", () => {
    const { container } = render(
      <Collapsible>
        <Collapsible.Trigger>Q</Collapsible.Trigger>
        <Collapsible.Content>A</Collapsible.Content>
      </Collapsible>,
    );
    const cls = container.querySelector("summary")!.className;
    expect(cls).toContain("astralis:list-item");
    expect(cls).toContain("astralis:list-none");
    expect(cls).not.toContain("astralis:flex");
  });
});
