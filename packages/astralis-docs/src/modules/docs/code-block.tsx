import { codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki";
import {
  Box,
  // Aliased: this module exports its own `CodeBlock`, the Shiki-rendered one
  // the docs use everywhere. The library's compound is the root it builds on.
  CodeBlock as CodeBlockRoot,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockContent,
  CodeBlockCode,
  CodeBlockCopyTrigger,
} from "astralis-ui";

interface CodeBlockProps {
  code: string;
  lang?: BundledLanguage;
  /** Optional filename rendered in a header strip above the code. */
  filename?: string;
}

/**
 * Server-rendered Shiki code block, built on the library's own CodeBlock
 * compound: every block on the site dogfoods the real component. Highlights
 * with a light + dark theme pair; `.astralis-dark` swaps token colors via the
 * --shiki-dark variables (see globals.css). Shiki's outer `<pre><code>` shell
 * is stripped so `CodeBlock.Content`/`Code` own the structure; backgrounds
 * come from our own tokens, not the Shiki theme.
 */
export async function CodeBlock({ code, lang = "tsx", filename }: CodeBlockProps) {
  const trimmed = code.trim();
  const html = await codeToHtml(trimmed, {
    lang,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
    defaultColor: "light",
  });
  const inner = html.replace(/^<pre[^>]*>\s*<code[^>]*>/, "").replace(/<\/code>\s*<\/pre>\s*$/, "");

  return (
    <CodeBlockRoot
      variant="solid"
      code={trimmed}
      my="0"
      position="relative"
      // CodeBlock owns its paint, so its corners, border and surfaces take no props.
      className="group rounded-xl border border-stroke bg-surface-subtle dark:bg-raised"
    >
      {filename && (
        <CodeBlockHeader className="border-stroke py-2.5 font-normal text-label-muted">
          <CodeBlockTitle>{filename}</CodeBlockTitle>
        </CodeBlockHeader>
      )}
      {/* Opacity stays a class: the reveal follows the block's hover and
          focus, and a class cannot override an opacity prop. */}
      <Box
        position="absolute"
        right="2.5"
        top="2.5"
        zIndex="lower"
        className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <CodeBlockCopyTrigger className="border border-stroke bg-surface text-label-muted hover:text-label" />
      </Box>
      <CodeBlockContent className="shiki docs-scroll p-4 text-[13px] leading-relaxed">
        <CodeBlockCode highlightedHtml={inner} />
      </CodeBlockContent>
    </CodeBlockRoot>
  );
}
