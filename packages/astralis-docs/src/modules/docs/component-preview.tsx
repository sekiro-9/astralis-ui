import fs from "fs";
import path from "path";
import { demos } from "@/modules/demos";
import { hasPlayground } from "@/modules/demos/playgrounds";
import { CodeBlock } from "./code-block";
import { PreviewTabs } from "./preview-tabs";
import { PlaygroundView } from "./playground/playground-view";

interface ComponentPreviewProps {
  /** Registry key of the demo (see src/modules/demos/index.ts). */
  name: keyof typeof demos;
  align?: "center" | "start";
}

/**
 * Live demo + its own source. The code tab shows the demo file verbatim from
 * disk, so example code can never drift from what actually renders.
 *
 * A third Playground tab appears on its own when this demo has an entry in the
 * playgrounds registry — adding a component there is the only step, so no MDX
 * page needs editing and the feature can't be half-applied to a page.
 */
export function ComponentPreview({ name, align }: ComponentPreviewProps) {
  const demo = demos[name];
  if (!demo) {
    throw new Error(`[docs] Unknown demo "${String(name)}" — add it to src/modules/demos/index.ts`);
  }

  const source = fs.readFileSync(
    path.join(process.cwd(), "src", "modules", "demos", demo.file),
    "utf8",
  );

  const Demo = demo.component;

  return (
    <PreviewTabs
      align={align}
      preview={<Demo />}
      code={<CodeBlock code={source} lang="tsx" />}
      playground={hasPlayground(name) ? <PlaygroundView name={name} /> : undefined}
    />
  );
}
