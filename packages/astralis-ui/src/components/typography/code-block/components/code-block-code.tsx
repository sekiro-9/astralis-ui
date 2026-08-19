import type { Ref } from "react";
import type { CodeBlockCodeProps } from "../code-block.types";

export function CodeBlockCode({
  highlightedHtml,
  children,
  code,
  ref,
  ...rest
}: CodeBlockCodeProps & { ref?: Ref<HTMLElement> }) {
  if (highlightedHtml != null) {
    return <code ref={ref} dangerouslySetInnerHTML={{ __html: highlightedHtml }} {...rest} />;
  }

  return (
    <code ref={ref} {...rest}>
      {children ?? code}
    </code>
  );
}

CodeBlockCode.displayName = "CodeBlock.Code";
