import type { Ref } from "react";
import { codeBlockTitleClasses } from "../code-block.styles";
import type { CodeBlockTitleProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

export const CodeBlockTitle = identify("CodeBlock.Title", function CodeBlockTitle({
  className = "",
  style,
  children,
  ref,
  ...rest
}: CodeBlockTitleProps & { ref?: Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} className={astralisMerge(codeBlockTitleClasses, className)} style={style} {...rest}>
      {children}
    </span>
  );
});
