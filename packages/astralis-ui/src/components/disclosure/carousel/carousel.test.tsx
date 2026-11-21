import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
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

/** A viewport `width` px wide for matchMedia, with `resize` firing the change
 *  listeners the way a browser does. */
function mockViewport(width: number) {
  const lists = new Set<{ query: string; listeners: Set<(e: { matches: boolean }) => void> }>();
  const matches = (query: string) => width >= parseFloat(/min-width: ([\d.]+)rem/.exec(query)?.[1] ?? "0") * 16;
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const entry = { query, listeners: new Set<(e: { matches: boolean }) => void>() };
    lists.add(entry);
    return {
      get matches() { return matches(query); },
      media: query,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => entry.listeners.add(fn),
      removeEventListener: (_: string, fn: (e: { matches: boolean }) => void) => entry.listeners.delete(fn),
    };
  }) as unknown as typeof window.matchMedia;
  return {
    resize(next: number) {
      width = next;
      act(() => lists.forEach((entry) => entry.listeners.forEach((fn) => fn({ matches: matches(entry.query) }))));
    },
    restore() { window.matchMedia = original; },
  };
}

function Six(props: Partial<CarouselProps>) {
  return (
    <Carousel {...props}>
      <Carousel.Track>
        {[1, 2, 3, 4, 5, 6].map((n) => <Carousel.Slide key={n}>Slide {n}</Carousel.Slide>)}
      </Carousel.Track>
      <Carousel.Indicators />
    </Carousel>
  );
}
const pages = () => screen.getAllByRole("tab").length;

describe("Carousel responsive slidesPerView and slideGap", () => {
  it("writes a number as the base layout variables", () => {
    render(<Six slidesPerView={2} slideGap={16} />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass("astralis-carousel-per-view", "astralis-carousel-gap");
    expect(region.style.getPropertyValue("--astralis-carousel-per-view-base")).toBe("2");
    expect(region.style.getPropertyValue("--astralis-carousel-gap-base")).toBe("16px");
    expect(screen.getByText("Slide 1").style.flex).toContain("var(--astralis-carousel-per-view)");
    expect(pages()).toBe(5);
  });

  it("writes a map as one class and variable per breakpoint, base filled in", () => {
    render(<Six slidesPerView={{ md: 2, lg: 3 }} slideGap={{ base: 8, lg: 24 }} />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass(
      "astralis-carousel-per-view", "astralis-carousel-per-view-md", "astralis-carousel-per-view-lg",
      "astralis-carousel-gap", "astralis-carousel-gap-lg",
    );
    expect(region.style.getPropertyValue("--astralis-carousel-per-view-base")).toBe("1");
    expect(region.style.getPropertyValue("--astralis-carousel-per-view-lg")).toBe("3");
    expect(region.style.getPropertyValue("--astralis-carousel-gap-lg")).toBe("24px");
  });

  it("pages by the count active at the viewport width, and follows a resize", () => {
    const viewport = mockViewport(390);
    try {
      render(<Six slidesPerView={{ base: 1, md: 2, lg: 3 }} />);
      expect(pages()).toBe(6);
      viewport.resize(800);
      expect(pages()).toBe(5);
      viewport.resize(1440);
      expect(pages()).toBe(4);
    } finally {
      viewport.restore();
    }
  });

  it("pulls the index back when a wider viewport moves the last page earlier", () => {
    const viewport = mockViewport(390);
    try {
      render(<Six slidesPerView={{ base: 1, lg: 3 }} defaultIndex={5} />);
      expect(screen.getAllByRole("tab")[5]).toHaveAttribute("aria-selected", "true");
      viewport.resize(1440);
      expect(screen.getAllByRole("tab")[3]).toHaveAttribute("aria-selected", "true");
    } finally {
      viewport.restore();
    }
  });

  it("hydrates the server's HTML without a mismatch at a desktop width", async () => {
    const viewport = mockViewport(1440);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const host = document.createElement("div");
    try {
      const tree = <Six slidesPerView={{ base: 1, md: 2, lg: 3 }} slideGap={{ base: 8, lg: 24 }} />;
      const html = renderToString(tree);
      host.innerHTML = html;
      document.body.appendChild(host);
      expect(host.innerHTML).toBe(html);
      await act(async () => { hydrateRoot(host, tree); });
      expect(errors).not.toHaveBeenCalled();
      expect(host.querySelectorAll('[role="tab"]').length).toBe(4);
    } finally {
      host.remove();
      errors.mockRestore();
      viewport.restore();
    }
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
