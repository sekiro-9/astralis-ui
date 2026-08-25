import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Popout } from "./index";

/** Zero-JS anchored disclosure: declarative popovertarget + CSS anchoring. */
describe("Popout", () => {
  it("wires trigger and panel declaratively with one generated id", () => {
    const { container } = render(
      <Popout>
        <Popout.Trigger>Open</Popout.Trigger>
        <Popout.Content>Panel</Popout.Content>
      </Popout>,
    );
    const button = container.querySelector("button")!;
    const panel = container.querySelector("[popover]") as HTMLElement;
    expect(button.getAttribute("popovertarget")).toBeTruthy();
    expect(panel.id).toBe(button.getAttribute("popovertarget"));
    expect(panel.getAttribute("popover")).toBe("auto");
    // No click handlers anywhere — invocation is the platform's.
    expect(button.onclick).toBeNull();
  });

  it("side/align map to position-area with collision fallbacks", () => {
    const { container } = render(
      <Popout>
        <Popout.Trigger>Open</Popout.Trigger>
        <Popout.Content side="top" align="end" sideOffset={4}>
          P
        </Popout.Content>
      </Popout>,
    );
    const style = (container.querySelector("[popover]") as HTMLElement).style;
    expect(style.getPropertyValue("position-area")).toBe("block-start span-inline-start");
    expect(style.getPropertyValue("position-try-fallbacks")).toBe("flip-block, flip-inline");
  });

  it("own props on parts beat the injected id (inheritProps contract)", () => {
    const { container } = render(
      <Popout>
        <Popout.Trigger popoutId="custom">Open</Popout.Trigger>
        <Popout.Content popoutId="custom">P</Popout.Content>
      </Popout>,
    );
    expect(container.querySelector("button")!.getAttribute("popovertarget")).toBe("custom");
  });
});
