import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks, blockSources, type BlockId } from "astralis-blocks";
import { CodeBlock } from "@/modules/docs/code-block";
import { BlockDetail } from "@/modules/blocks/components/block-detail";

export function generateStaticParams() {
  return Object.keys(blocks).map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = blocks[id as BlockId];
  if (!entry) return {};
  return { title: entry.meta.name, description: entry.meta.description };
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = blocks[id as BlockId];
  if (!entry) notFound();

  const [file] = blockSources[id as BlockId];

  return (
    <BlockDetail
      meta={entry.meta}
      filename={file.path}
      code={<CodeBlock code={file.content} lang="tsx" filename={file.path} />}
    />
  );
}
