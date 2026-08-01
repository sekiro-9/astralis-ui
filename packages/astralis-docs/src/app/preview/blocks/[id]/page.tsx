import { notFound } from "next/navigation";
import { blocks, type BlockId } from "astralis-blocks";

/**
 * A block on its own, with no site chrome — the render target for the gallery
 * thumbnails and the detail page's viewport switcher. Loading it in an iframe
 * is what makes the preview honest: the block's `lg:` breakpoints resolve
 * against the iframe's width, so a thumbnail shows the real desktop layout and
 * the mobile toggle shows the real mobile one.
 */
export function generateStaticParams() {
  return Object.keys(blocks).map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function BlockPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = blocks[id as BlockId];
  if (!entry) notFound();

  const Block = entry.component;

  // Where the block sits when it is shorter than the frame. Page-edge furniture
  // reads wrong floating in the middle: a navbar belongs against the top, a
  // footer against the bottom. Everything else — heroes, mid-page sections —
  // centres. A single auto margin pins to the opposite edge and still collapses
  // to zero once the block outgrows the viewport, so tall blocks are unaffected.
  const placement =
    entry.meta.category === "navbar"
      ? "mb-auto"
      : entry.meta.category === "footer"
        ? "mt-auto"
        : "my-auto";

  return (
    <>
      {/*
        Dev-only cosmetics: Next injects its route indicator into every page,
        including this one, so it shows up floating in the corner of each
        thumbnail. Hidden here rather than via `devIndicators: false`, which
        would remove it from the whole site while developing. Errors still
        surface in the terminal and the parent document.
      */}
      <style>{`nextjs-portal { display: none; }`}</style>
      {/*
        Place the block when it is shorter than the window, so opening a preview
        in its own tab does not leave it stranded — centred for a mid-page
        section, pinned to the matching edge for a navbar or footer (see
        `placement`).

        Auto margins rather than `justify-*`: they collapse to zero once the
        block outgrows the viewport, whereas centred flex content overflows in
        both directions and clips its own top out of reach.
      */}
      <div className="flex min-h-screen flex-col">
        <div data-block-frame className={placement}>
          <Block />
        </div>
      </div>
    </>
  );
}
