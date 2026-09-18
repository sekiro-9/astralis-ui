import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";
import { DataList } from "./data-list";
import { Timeline } from "./timeline";

describe("Badge", () => {
  it("paints from the accent channel of its colorScheme and lets a consumer class win", () => {
    render(
      <Badge colorScheme="green" variant="solid" className="astralis:rounded-none">
        Active
      </Badge>,
    );
    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("astralis-accent-green");
    expect(badge.className).toMatch(/astralis:bg-accent-solid/);
    expect(badge.className).toMatch(/astralis:rounded-none/);
    expect(badge.className).not.toMatch(/astralis:rounded-full/);
  });
});

describe("DataList", () => {
  it("renders a description list whose size and orientation travel as data attributes", () => {
    const { container } = render(
      <DataList size="lg" orientation="vertical">
        <DataList.Item>
          <DataList.Label>Plan</DataList.Label>
          <DataList.Value>Pro</DataList.Value>
        </DataList.Item>
      </DataList>,
    );
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveAttribute("data-datalist-size", "lg");
    expect(dl).toHaveAttribute("data-datalist-orientation", "vertical");
    expect(dl.querySelector("dt")).toHaveTextContent("Plan");
    expect(dl.querySelector("dd")).toHaveTextContent("Pro");
  });
});

describe("Timeline", () => {
  it("puts the Indicator in the rail and the rest beside it, matched by identity", () => {
    const { container } = render(
      <Timeline colorScheme="purple">
        <Timeline.Item>
          <Timeline.Indicator>1</Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Title>Shipped</Timeline.Title>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );
    const item = container.querySelector("[data-timeline-item]")!;
    const [rail, body] = Array.from(item.children);
    expect(rail).toHaveTextContent("1");
    expect(body).toHaveTextContent("Shipped");
    expect(body).not.toHaveTextContent("1");
    expect(container.firstElementChild).toHaveClass("astralis-accent-purple");
  });

  it("hides an empty indicator dot from assistive tech", () => {
    const { container } = render(
      <Timeline>
        <Timeline.Item>
          <Timeline.Indicator />
          <Timeline.Content>Event</Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );
    expect(container.querySelector("[data-timeline-item] span")).toHaveAttribute("aria-hidden", "true");
  });
});
