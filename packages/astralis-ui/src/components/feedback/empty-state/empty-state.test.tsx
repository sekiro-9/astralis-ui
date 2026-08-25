import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EmptyState } from "./index";

/** Zero-client compound: size travels via data attribute, not context. */
describe("EmptyState", () => {
  it("stamps data-empty-state-size for the parts' parent-keyed variants", () => {
    const { container } = render(
      <EmptyState size="lg">
        <EmptyState.Indicator>i</EmptyState.Indicator>
        <EmptyState.Title>Nothing here</EmptyState.Title>
        <EmptyState.Description>Try widening the filters.</EmptyState.Description>
        <EmptyState.Actions>go</EmptyState.Actions>
      </EmptyState>,
    );
    const root = container.querySelector('[role="status"]')!;
    expect(root.getAttribute("data-empty-state-size")).toBe("lg");
    expect(root.textContent).toContain("Nothing here");
  });

  it("hides the indicator from assistive tech", () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Indicator>icon</EmptyState.Indicator>
      </EmptyState>,
    );
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("icon");
  });
});
