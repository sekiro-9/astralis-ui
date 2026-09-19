import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Carousel } from "./index";
import type { CarouselProps } from "./carousel.types";

function Fixture(props: Partial<CarouselProps>) {
  return (
    <Carousel {...props}>
      <Carousel.Track>
        <Carousel.Slide>One</Carousel.Slide>
        <Carousel.Slide>Two</Carousel.Slide>
        <Carousel.Slide>Three</Carousel.Slide>
      </Carousel.Track>
      <Carousel.ProgressText />
    </Carousel>
  );
}

const progress = () => screen.getByText(/\d \/ 3/).textContent;
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("Carousel autoplay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("advances on the interval", () => {
    render(<Fixture autoPlay autoPlayInterval={1000} />);
    expect(progress()).toBe("1 / 3");
    tick(1000);
    expect(progress()).toBe("2 / 3");
  });

  it("holds while hovered and resumes after the pointer leaves", () => {
    render(<Fixture autoPlay autoPlayInterval={1000} />);
    const region = screen.getByRole("region");
    fireEvent.mouseEnter(region);
    tick(3000);
    expect(progress()).toBe("1 / 3");
    fireEvent.mouseLeave(region);
    tick(1000);
    expect(progress()).toBe("2 / 3");
  });

  it("goes through goTo: fires beforeChange and afterChange, and stops at the end without loop", () => {
    const beforeChange = vi.fn();
    const afterChange = vi.fn();
    render(<Fixture autoPlay autoPlayInterval={1000} speed={200} beforeChange={beforeChange} afterChange={afterChange} />);
    tick(1000);
    expect(beforeChange).toHaveBeenCalledWith(0, 1);
    tick(200);
    expect(afterChange).toHaveBeenCalledWith(1);
    tick(5000);
    expect(progress()).toBe("3 / 3");
  });

  it("never overshoots the last page when stepping by more than one", () => {
    // Two per view over three slides: the last page starts at index 1, not 2.
    render(<Fixture autoPlay autoPlayInterval={1000} slidesPerView={2} slidesToScroll={2} />);
    tick(1000);
    expect(progress()).toBe("2 / 3");
    tick(5000);
    expect(progress()).toBe("2 / 3");
  });

  it("clears a pending afterChange when unmounted", () => {
    const afterChange = vi.fn();
    const { unmount } = render(<Fixture autoPlay autoPlayInterval={1000} speed={300} afterChange={afterChange} />);
    tick(1000);
    unmount();
    tick(1000);
    expect(afterChange).not.toHaveBeenCalled();
  });
});

describe("Carousel region", () => {
  it("is a named, focusable region with a visible focus style, driven by arrow keys", () => {
    render(<Fixture />);
    const region = screen.getByRole("region", { name: "Carousel" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region.className).toMatch(/astralis:focus-visible:outline-2/);
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(progress()).toBe("2 / 3");
  });

  it("takes a consumer name", () => {
    render(<Fixture aria-label="Featured products" />);
    expect(screen.getByRole("region", { name: "Featured products" })).toBeInTheDocument();
  });
});
