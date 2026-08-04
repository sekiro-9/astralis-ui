import {
  CodeBlockRoot,
  CodeBlockContent,
  CodeBlockCode,
  CodeBlockCopyTrigger,
} from "astralis-ui";

interface CopyCommandProps {
  command: string;
}

/**
 * A one-line shell command with a copy button. Built on the library's CodeBlock
 * compound rather than a hand-rolled button — a command IS a code block, and
 * CopyTrigger already reads Root's `code`.
 *
 * Flat parts, not `CodeBlock.*`: this is a Server Component, and namespace
 * access on a client-reference stub is undefined across the RSC boundary.
 *
 * The overrides are prefixed even though the docs site has its own Tailwind.
 * astralisMerge only recognises prefixed classes, so an unprefixed `flex` sits
 * *alongside* Root's `astralis:block` rather than replacing it — which is why
 * this used to render as a full-width box with the button on its own line.
 */
export function CopyCommand({ command }: CopyCommandProps) {
  return (
    <CodeBlockRoot
      variant="outline"
      code={command}
      className="astralis:inline-flex astralis:w-auto astralis:max-w-full astralis:flex-row astralis:items-center astralis:gap-1 astralis:rounded-md astralis:border-stroke-base astralis:bg-surface-subtle astralis:py-1 astralis:pl-3 astralis:pr-1"
    >
      <CodeBlockContent className="astralis:min-w-0 astralis:p-0">
        <CodeBlockCode className="astralis:text-xs astralis:text-label-muted">
          {command}
        </CodeBlockCode>
      </CodeBlockContent>
      <CodeBlockCopyTrigger className="astralis:size-6 astralis:text-label-subtle" />
    </CodeBlockRoot>
  );
}
