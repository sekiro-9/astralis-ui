import {
  CodeBlock,
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
 * Styling: keyword utilities (inline-flex, items-center, ...) ride className;
 * VALUE overrides use the `style` escape hatch with token variables — the
 * per-value utility classes no longer ship since the var-channel migration,
 * and style keeps every override on the theme's own tokens.
 */
export function CopyCommand({ command }: CopyCommandProps) {
  return (
    <CodeBlock
      variant="outline"
      code={command}
      maxW="full"
      className="astralis:inline-flex astralis:flex-row astralis:items-center"
      style={{
        width: "auto",
        gap: "var(--astralis-spacing-1)",
        borderRadius: "var(--astralis-border-radius-md)",
        borderColor: "var(--astralis-color-stroke-base)",
        background: "var(--astralis-color-surface-subtle)",
        padding:
          "var(--astralis-spacing-1) var(--astralis-spacing-1) var(--astralis-spacing-1) var(--astralis-spacing-3)",
      }}
    >
      <CodeBlockContent style={{ minWidth: 0, padding: 0 }}>
        <CodeBlockCode
          className="astralis:text-xs"
          style={{ color: "var(--astralis-color-label-muted)" }}
        >
          {command}
        </CodeBlockCode>
      </CodeBlockContent>
      <CodeBlockCopyTrigger
        style={{
          width: "var(--astralis-size-6)",
          height: "var(--astralis-size-6)",
          color: "var(--astralis-color-label-subtle)",
        }}
      />
    </CodeBlock>
  );
}
