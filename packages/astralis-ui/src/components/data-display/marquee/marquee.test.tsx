import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Marquee } from "./index";

const track = (container: HTMLElement) => container.firstElementChild!.firstElementChild as HTMLElement;

describe("Marquee", () => {
  it("renders the content twice, the copy hidden from assistive tech", () => {
    const { container, getAllByText } = render(
      <Marquee>
        <Marquee.Item>News</Marquee.Item>
      </Marquee>,
    );
    expect(getAllByText("News")).toHaveLength(2);
    const [original, copy] = Array.from(track(container).children);
    expect(original).not.toHaveAttribute("aria-hidden");
    expect(copy).toHaveAttribute("aria-hidden", "true");
  });

  it("pauses while hovered when asked to", () => {
    const { container } = render(
      <Marquee pauseOnHover>
        <Marquee.Item>News</Marquee.Item>
      </Marquee>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(track(container).style.animationPlayState).toBe("running");
    fireEvent.mouseEnter(root);
    expect(track(container).style.animationPlayState).toBe("paused");
    fireEvent.mouseLeave(root);
    expect(track(container).style.animationPlayState).toBe("running");
  });

  it("scrolls the other way for direction right", () => {
    const { container } = render(
      <Marquee direction="right">
        <Marquee.Item>News</Marquee.Item>
      </Marquee>,
    );
    expect(track(container).style.animationName).toBe("astralis-marquee-x-rev");
  });

  it("lets a consumer class override the item's own", () => {
    const { getAllByText } = render(
      <Marquee>
        <Marquee.Item className="astralis:items-start">News</Marquee.Item>
      </Marquee>,
    );
    const item = getAllByText("News")[0];
    expect(item.className).toMatch(/astralis:items-start/);
    expect(item.className).not.toMatch(/astralis:items-center/);
  });
});
