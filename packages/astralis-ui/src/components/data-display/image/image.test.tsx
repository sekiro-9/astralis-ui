import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { Image } from "./index";

/**
 * The server HTML must carry the real src, so the browser starts the download
 * from the HTML and visitors without JavaScript still see the picture.
 */
describe("Image server render", () => {
  it.each([
    ["default", {}],
    ["lazy", { loading: "lazy" as const }],
    ["eager", { loading: "eager" as const }],
  ])("puts the real src in the HTML (%s)", (_, props) => {
    const html = renderToStaticMarkup(<Image src="/hero.jpg" alt="Hero" {...props} />);
    expect(html).toContain('src="/hero.jpg"');
    expect(html).not.toContain("data:image");
    expect(html).toContain("astralis-image-loading");
  });

  it("draws a low-resolution placeholder behind the real src", () => {
    const html = renderToStaticMarkup(<Image src="/hero.jpg" alt="" placeholder="/hero-tiny.jpg" />);
    expect(html).toContain('src="/hero.jpg"');
    expect(html).toContain('background-image:url(&quot;/hero-tiny.jpg&quot;)');
    expect(html).not.toContain("astralis-image-loading");
  });

  it("renders the fallback for a missing src", () => {
    const html = renderToStaticMarkup(<Image src="" alt="" fallback={<span>none</span>} />);
    expect(html).toBe("<span>none</span>");
  });
});

describe("Image loading state", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the placeholder until the image loads, then removes it", () => {
    const onLoad = vi.fn();
    const { container } = render(<Image src="/a.png" alt="" onLoad={onLoad} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveClass("astralis-image-loading");
    fireEvent.load(img);
    expect(img).not.toHaveClass("astralis-image-loading");
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("a new src after a failure loads again instead of keeping the fallback", () => {
    const { container, rerender } = render(<Image src="/missing.png" alt="" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.textContent).toContain("Failed to load");
    rerender(<Image src="/b.png" alt="" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/b.png");
    expect(img).toHaveClass("astralis-image-loading");
  });

  it("a new src after a load shows the placeholder again", () => {
    const { container, rerender } = render(<Image src="/a.png" alt="" />);
    fireEvent.load(container.querySelector("img")!);
    rerender(<Image src="/b.png" alt="" />);
    expect(container.querySelector("img")).toHaveClass("astralis-image-loading");
  });

  const settledNode = (naturalWidth: number) => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "currentSrc", "get").mockReturnValue("http://x/a.png");
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(naturalWidth);
  };

  it("an image that finished before React attached reads as loaded", () => {
    settledNode(640);
    const onLoad = vi.fn();
    const { container } = render(<Image src="/a.png" alt="" onLoad={onLoad} />);
    expect(container.querySelector("img")).not.toHaveClass("astralis-image-loading");
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("an image that failed before React attached shows the fallback", () => {
    settledNode(0);
    const onError = vi.fn();
    const { container } = render(<Image src="/missing.png" alt="" onError={onError} />);
    expect(container.textContent).toContain("Failed to load");
    expect(onError).toHaveBeenCalledOnce();
  });
});

/**
 * The DOM remainder (id, data-*, aria-*) has to land on whichever element is
 * outermost, because that is the element a caller can point at: a builder
 * addresses the node it placed, a test addresses the thing it rendered.
 */
describe("Image forwards DOM props to its outermost element", () => {
  it("onto the img when it stands alone", () => {
    const { container } = render(<Image src="/a.png" alt="a" data-node="n1" />);
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("IMG");
    expect(outer?.getAttribute("data-node")).toBe("n1");
  });

  it("onto the ratio box when an aspect ratio wraps it", () => {
    const { container } = render(
      <Image src="/a.png" alt="a" aspectRatio="video" data-node="n2" />,
    );
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("DIV");
    expect(outer?.getAttribute("data-node")).toBe("n2");
    expect(container.querySelector("img")?.getAttribute("data-node")).toBeNull();
  });

  it("onto the figure when a caption wraps it", () => {
    const { container } = render(
      <Image src="/a.png" alt="a" caption="c" data-node="n3" />,
    );
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("FIGURE");
    expect(outer?.getAttribute("data-node")).toBe("n3");
  });

  it("onto the fallback when a standalone image fails to load", () => {
    const { container } = render(<Image src="/missing.png" alt="a" data-node="n4" />);
    fireEvent.error(container.querySelector("img")!);
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe("DIV");
    expect(outer?.textContent).toContain("Failed to load");
    expect(outer?.getAttribute("data-node")).toBe("n4");
  });
});

const GROUP = [
  { src: "/1.png", alt: "One" },
  { src: "/2.png", alt: "Two" },
  { src: "/3.png", alt: "Three" },
];

describe("Image preview", () => {
  it("the previewable image is a focusable button that opens a modal dialog, and focus returns on close", async () => {
    const user = userEvent.setup();
    render(<Image src="/a.png" alt="Harbour" preview />);

    const thumb = screen.getByRole("button", { name: "Harbour" });
    expect(thumb).toHaveAttribute("tabindex", "0");
    thumb.focus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "Image preview: Harbour" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    for (const name of ["Zoom out", "Zoom in", "Rotate", "Close preview"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("type", "button");
    }
    await waitFor(() => expect(screen.getByRole("button", { name: "Zoom out" })).toHaveFocus());

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(thumb).toHaveFocus();
  });

  it("lightbox controls never submit a surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Image src="/a.png" alt="Harbour" preview />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Harbour" }));
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    await user.click(screen.getByRole("button", { name: "Rotate" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("Image.Group", () => {
  it("thumbnails are buttons; an arrow key moves exactly one image", async () => {
    const user = userEvent.setup();
    render(<Image.Group items={GROUP} />);

    await user.click(screen.getByRole("button", { name: "One" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "One");
    expect(within(dialog).getByText("Image 1 of 3")).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Two");
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Three");
    expect(within(dialog).queryByRole("button", { name: "Next image" })).toBeNull();

    await user.keyboard("{ArrowLeft}");
    expect(within(dialog).getByRole("img")).toHaveAttribute("alt", "Two");
  });

  it("Escape closes the lightbox, and focus goes back to the thumbnail", async () => {
    const user = userEvent.setup();
    render(<Image.Group items={GROUP} />);
    const thumb = screen.getByRole("button", { name: "Two" });
    await user.click(thumb);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(thumb).toHaveFocus();
  });
});
