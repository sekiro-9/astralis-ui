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
 * Every override rides `style` with token variables: it has to beat
 * CodeBlock's own layout and padding classes, and it keeps each value on the
 * theme's tokens.
 */
export function CopyCommand({ command }: CopyCommandProps) {
  return (
    <CodeBlock
      variant="outline"
      code={command}
      maxW="full"
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
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
          style={{
            fontSize: "var(--astralis-font-size-xs)",
            color: "var(--astralis-color-label-muted)",
          }}
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
