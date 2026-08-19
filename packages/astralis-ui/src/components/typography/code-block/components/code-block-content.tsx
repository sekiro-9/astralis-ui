import type { Ref } from "react";
import { codeBlockContentClasses } from "../code-block.styles";
import type { CodeBlockContentProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { inheritProps } from "../../../../utils/inherit-props";
import { CodeBlockCode } from "./code-block-code";

export function CodeBlockContent({
  className = "",
  style,
  children,
  code,
  ref,
  ...rest
}: CodeBlockContentProps & { ref?: Ref<HTMLPreElement> }) {
  return (
    <pre ref={ref} className={astralisMerge(codeBlockContentClasses, className)} style={style} {...rest}>
      {/* Forward the Root's code into a bare <CodeBlock.Code /> so its
          no-children fallback still renders the source. */}
      {code === undefined ? children : inheritProps(children, new Map([[CodeBlockCode, { code }]]))}
    </pre>
  );
}

CodeBlockContent.displayName = "CodeBlock.Content";
