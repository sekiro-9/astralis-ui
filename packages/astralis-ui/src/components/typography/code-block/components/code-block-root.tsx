import { splitPlacement } from "../../../../utils/placement";
import type { Ref } from "react";
import { CodeBlockContext } from "../code-block.context";
import { codeBlockRootVariants } from "../code-block.styles";
import type { CodeBlockRootProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function CodeBlockRoot({
  variant = "subtle",
  size = "md",
  code,
  className = "",
  children,
  ref,
  ...rest
}: CodeBlockRootProps & { ref?: Ref<HTMLDivElement> }) {
  // `style` stays inside `rest` ON PURPOSE: splitPlacement folds the channel
  // vars under it (user keys win) and returns both via rest.style. Destructuring
  // style separately and rendering style={style} before {...domProps} let the
  // folded style REPLACE the user's — a silent stomp, not a merge.
  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <CodeBlockContext.Provider value={{ code, size }}>
      <div
        ref={ref}
        className={astralisMerge(codeBlockRootVariants({ variant }), placementClass, className)}
        {...domProps}
      >
        {children}
      </div>
    </CodeBlockContext.Provider>
  );
}

CodeBlockRoot.displayName = "CodeBlock.Root";
