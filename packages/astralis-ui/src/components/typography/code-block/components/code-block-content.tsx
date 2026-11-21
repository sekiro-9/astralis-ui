import type { Ref } from "react";
import { codeBlockContentClasses } from "../code-block.styles";
import type { CodeBlockContentProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { inheritProps } from "../../../../utils/inherit-props";
import { CodeBlockCode } from "./code-block-code";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

export const CodeBlockContent = identify("CodeBlock.Content", function CodeBlockContent({
  className = "",
  children,
  code,
  ref,
  ...props
}: CodeBlockContentProps & { ref?: Ref<HTMLPreElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <pre ref={ref} className={astralisMerge(codeBlockContentClasses, placementClass, className)} {...rest}>
      {/* Forward the Root's code into a bare <CodeBlock.Code /> so its
          no-children fallback still renders the source. */}
      {code === undefined ? children : inheritProps(children, new Map([[CodeBlockCode, { code }]]))}
    </pre>
  );
});
