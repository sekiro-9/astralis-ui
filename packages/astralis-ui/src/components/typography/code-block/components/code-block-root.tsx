import { splitPlacement } from "../../../../utils/placement";
import type { Ref } from "react";
import { codeBlockRootVariants } from "../code-block.styles";
import type { CodeBlockRootProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { inheritProps } from "../../../../utils/inherit-props";
import { CodeBlockContent } from "./code-block-content";

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

  // The compound is a server shell with one client leaf (CopyTrigger).
  // `size` travels as a data attribute (Content's classes key off it at any
  // depth); `code` is cloned into Content, which re-injects it into Code for
  // the no-children fallback render. CopyTrigger reads the rendered code from
  // the DOM at click time — see code-block-copy-trigger.tsx.
  return (
    <div
      ref={ref}
      data-astralis-codeblock=""
      data-codeblock-size={size}
      className={astralisMerge(codeBlockRootVariants({ variant }), placementClass, className)}
      {...domProps}
    >
      {code === undefined ? children : inheritProps(children, new Map([[CodeBlockContent, { code }]]))}
    </div>
  );
}

CodeBlockRoot.displayName = "CodeBlock.Root";
