import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { useState, type ComponentPropsWithoutRef, type CSSProperties, type Ref } from "react";
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
 * `width`/`height` are the img's intrinsic size. They size the box on their
 * own, but a sizing prop must win over them, or a fluid or responsive size
 * can never apply.
 */
describe("Image width/height against sizing props", () => {
  const img = (el: React.ReactElement) => render(el).container.querySelector("img")!;

  it("alone, they reserve the box inline", () => {
    const node = img(<Image src="/a.png" alt="" width={140} height={90} />);
    expect(node.style.width).toBe("140px");
    expect(node.style.height).toBe("90px");
  });

  it("with w/h, they stay attributes and the props size the image", () => {
    const node = img(<Image src="/a.png" alt="" width={1419} height={1400} w="full" h="full" />);
    expect(node.style.width).toBe("");
    expect(node.style.height).toBe("");
    expect(node).toHaveAttribute("width", "1419");
    expect(node).toHaveAttribute("height", "1400");
    expect(node).toHaveClass("astralis-w", "astralis-h");
  });

  it("a responsive h wins too", () => {
    const node = img(<Image src="/a.png" alt="" width={120} height={40} w="auto" h={{ base: "1.5rem", lg: "2.25rem" }} />);
    expect(node.style.height).toBe("");
    expect(node.style.getPropertyValue("--astralis-h-lg")).toBe("2.25rem");
  });

  it("the ratio box drops its inline width for w", () => {
    const { container } = render(<Image src="/a.png" alt="" aspectRatio="video" width={300} w="full" />);
    expect((container.firstElementChild as HTMLElement).style.width).toBe("");
  });

  it("the failure box follows w and keeps the ratio", () => {
    const { container } = render(<Image src="/missing.png" alt="" width={140} height={90} w="60" />);
    fireEvent.error(container.querySelector("img")!);
    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveClass("astralis-w");
    expect(box.style.width).toBe("");
    expect(box.style.aspectRatio).toBe("140 / 90");
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

interface StaticImport {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

interface FrameworkImageProps
  extends Omit<ComponentPropsWithoutRef<"img">, "src" | "width" | "height" | "loading" | "placeholder"> {
  src: string | StaticImport;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  ref?: Ref<HTMLImageElement>;
}

/**
 * Behaves like next/image where it matters here: it builds its own srcset,
 * refuses priority with loading="lazy", merges `fill`'s inline positioning
 * with Object.assign (so an undefined key from the caller erases it), and
 * paints a blur background that its own onLoad removes.
 */
function FrameworkImage({
  src,
  width,
  height,
  fill,
  priority,
  quality,
  loading,
  placeholder = "empty",
  blurDataURL,
  style,
  onLoad,
  ref,
  ...rest
}: FrameworkImageProps) {
  if (priority && loading === "lazy") throw new Error("priority and loading='lazy' together");
  const data = typeof src === "string" ? undefined : src;
  const url = typeof src === "string" ? src : src.src;
  const [blurDone, setBlurDone] = useState(false);
  const blur = placeholder === "blur" && !blurDone ? { backgroundImage: `url("${blurDataURL ?? data?.blurDataURL}")` } : {};
  const merged = Object.assign(
    fill ? { position: "absolute", width: "100%", height: "100%", inset: 0 } : {},
    { color: "transparent" },
    style,
    blur,
  ) as CSSProperties;
  return (
    <img
      {...rest}
      ref={ref}
      data-quality={quality}
      data-fill={fill ? "" : undefined}
      loading={priority ? "eager" : (loading ?? "lazy")}
      width={width ?? data?.width}
      height={height ?? data?.height}
      style={merged}
      srcSet={`${url}?w=640 640w, ${url}?w=1080 1080w`}
      src={`${url}?w=1080`}
      onLoad={(event) => {
        setBlurDone(true);
        onLoad?.(event);
      }}
    />
  );
}

/**
 * `as` renders the picture through a framework's image component, which does
 * the resizing and loading, while the frame, look, loading state and fallback
 * stay the library's.
 */
describe("Image through an image component (as)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("passes the component's own props through, without a lazy default, and keeps the library's look", () => {
    const { container } = render(
      <Image as={FrameworkImage} src="/hero.jpg" alt="Hero" width={1600} height={900} sizes="100vw" priority quality={70} rounded="xl" objectFit="contain" />,
    );
    const img = container.querySelector("img")!;
    expect(container.firstElementChild).toBe(img);
    expect(img.getAttribute("srcset")).toContain("/hero.jpg?w=640 640w");
    expect(img).toHaveAttribute("sizes", "100vw");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("data-quality", "70");
    expect(img).toHaveClass("astralis:rounded-xl", "astralis:object-contain", "astralis-image-loading");
    expect(img.style.color).toBe("transparent");
    expect(img.style.width).toBe("1600px");
  });

  it("drives the loading state and the fallback from the component's events", () => {
    const targets: EventTarget[] = [];
    const onLoad = vi.fn((event: React.SyntheticEvent<HTMLImageElement>) => targets.push(event.currentTarget));
    const onError = vi.fn();
    const { container, rerender } = render(
      <Image as={FrameworkImage} src="/a.jpg" alt="" width={40} height={40} onLoad={onLoad} onError={onError} />,
    );
    const img = container.querySelector("img")!;
    fireEvent.load(img);
    expect(img).not.toHaveClass("astralis-image-loading");
    expect(onLoad).toHaveBeenCalledOnce();
    expect(targets).toEqual([img]);

    rerender(<Image as={FrameworkImage} src="/missing.jpg" alt="" width={40} height={40} onLoad={onLoad} onError={onError} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.textContent).toContain("Failed to load");
    expect(onError).toHaveBeenCalledOnce();
  });

  it("hands placeholder to the component: its blur shows, with no pulsing surface beneath", () => {
    const { container } = render(
      <Image as={FrameworkImage} src="/a.jpg" alt="" width={40} height={40} placeholder="blur" blurDataURL="data:image/png;base64,AAAA" />,
    );
    const img = container.querySelector("img")!;
    expect(img.style.backgroundImage).toContain("data:image/png;base64,AAAA");
    expect(img.style.objectFit).toBe("cover");
    expect(img).not.toHaveClass("astralis-image-loading");
    fireEvent.load(img);
    expect(img.style.backgroundImage).toBe("");
  });

  it("a static import sizes the frame from its own width and height", () => {
    const hero = { src: "/static/hero.jpg", width: 400, height: 300 };
    const { container } = render(<Image as={FrameworkImage} src={hero} alt="" />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/static/hero.jpg?w=1080");
    expect(img).toHaveAttribute("width", "400");
    expect(img.style.width).toBe("400px");
    expect(img.style.height).toBe("300px");
  });

  it("fill keeps the component's own absolute positioning, inside a ratio frame or not", () => {
    const framed = render(<Image as={FrameworkImage} src="/a.jpg" alt="" fill sizes="50vw" aspectRatio="square" rounded="lg" />);
    const box = framed.container.firstElementChild as HTMLElement;
    expect(box.style.aspectRatio).toBe("1 / 1");
    expect(box.style.position).toBe("relative");
    const inner = box.querySelector("img")!;
    expect(inner).toHaveAttribute("data-fill");
    expect(inner.style.position).toBe("absolute");
    expect(inner.style.width).toBe("100%");

    const bareView = render(<Image as={FrameworkImage} src="/b.jpg" alt="" fill />);
    const bare = bareView.container.querySelector("img")!;
    expect(bare.style.width).toBe("100%");
    expect(bare.style.height).toBe("100%");
    fireEvent.error(bare);
    const fallbackBox = bareView.container.firstElementChild as HTMLElement;
    expect(fallbackBox.textContent).toContain("Failed to load");
    expect(fallbackBox).toHaveClass("astralis:absolute", "astralis:inset-0");
  });

  it("addressing props go to the outermost element, the component's own to the component", () => {
    const { container } = render(
      <Image as={FrameworkImage} src="/a.jpg" alt="" width={40} height={40} aspectRatio="video" id="hero" data-node="n5" quality={50} />,
    );
    const box = container.firstElementChild as HTMLElement;
    const img = container.querySelector("img")!;
    expect(box).toHaveAttribute("id", "hero");
    expect(box).toHaveAttribute("data-node", "n5");
    expect(box).not.toHaveAttribute("data-quality");
    expect(img).toHaveAttribute("data-quality", "50");
    expect(img).not.toHaveAttribute("data-node");
  });

  it("an image finished before React attached reaches the component's handler and the caller once", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "currentSrc", "get").mockReturnValue("http://x/a.jpg");
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
    const onLoad = vi.fn();
    const { container } = render(
      <Image as={FrameworkImage} src="/a.jpg" alt="" width={40} height={40} placeholder="blur" blurDataURL="data:image/png;base64,AAAA" onLoad={onLoad} />,
    );
    const img = container.querySelector("img")!;
    expect(img.style.backgroundImage).toBe("");
    fireEvent.load(img);
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("types follow the component", () => {
    const hero = { src: "/s.jpg", width: 4, height: 3 };
    const typed = [
      <Image key="a" as={FrameworkImage} src={hero} alt="" fill priority w="full" rounded="md" />,
      // @ts-expect-error `fill` is the component's prop; the plain img has none
      <Image key="b" src="/a.jpg" alt="" fill />,
      // @ts-expect-error the component's own `src` type applies
      <Image key="c" as={FrameworkImage} src={3} alt="" />,
      // @ts-expect-error a static import is a src only for a component that takes one
      <Image key="d" src={hero} alt="" />,
    ];
    expect(typed).toHaveLength(4);
  });
});

describe("Image reports each outcome once", () => {
  afterEach(() => vi.restoreAllMocks());

  it("a cached image that also fires its load event calls onLoad once", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "currentSrc", "get").mockReturnValue("http://x/a.png");
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
    const onLoad = vi.fn();
    const { container } = render(<Image src="/a.png" alt="" onLoad={onLoad} />);
    fireEvent.load(container.querySelector("img")!);
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("keeps lazy loading as the plain img's default", () => {
    const { container } = render(<Image src="/a.png" alt="" />);
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
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
