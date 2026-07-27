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
 */
export function CopyCommand({ command }: CopyCommandProps) {
  return (
    <CodeBlockRoot
      variant="outline"
      code={command}
      className="group flex-row items-center gap-1 rounded-lg border-stroke-subtle bg-surface-subtle py-1 pl-3 pr-1"
    >
      <CodeBlockContent className="p-0">
        <CodeBlockCode className="text-xs text-label-muted">{command}</CodeBlockCode>
      </CodeBlockContent>
      <CodeBlockCopyTrigger className="text-label-subtle hover:text-label" />
    </CodeBlockRoot>
  );
}
