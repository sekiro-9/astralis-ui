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
        Centre the block when it is shorter than the window, so opening a
        preview in its own tab does not leave it stranded against the top edge.

        `my-auto` rather than `justify-center`: auto margins collapse to zero
        once the block outgrows the viewport, whereas centred flex content
        overflows in both directions and clips its own top out of reach.

        Neither affects the iframes — their height is measured FROM the block,
        so there is never free space to distribute.
      */}
      <div className="flex min-h-screen flex-col">
        {/* Measurement target: the thumbnail sizes itself to this element's
            height so a card crops to the block instead of a fixed canvas. */}
        <div data-block-frame className="my-auto">
          <Block />
        </div>
      </div>
    </>
  );
}
