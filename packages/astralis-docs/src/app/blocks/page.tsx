import type { Metadata } from "next";
import { Heading, Text } from "astralis-ui";
import { BlockGallery } from "@/modules/blocks";
import { groupByCategory, listBlocks } from "@/lib/blocks";

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Section-level compositions of Astralis primitives — heroes, pricing, footers. Copied into your project as source you own, not imported from a package.",
};

export default function BlocksPage() {
  const all = listBlocks();

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-5xl">
        <Heading as="h1" size="3xl" weight="semibold" letterSpacing="tight">
          Blocks
        </Heading>
        <Text color="muted" lineHeight="relaxed" className="astralis:mt-3">
          Ready-made page sections built from the primitives you already use. Blocks
          aren&apos;t imported from a package — the CLI copies the source into your project,
          so you own the file and edit it like any other component.
        </Text>
      </header>

      <BlockGallery groups={groupByCategory(all)} all={all} />
    </div>
  );
}
