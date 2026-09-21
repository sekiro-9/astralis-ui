import type { ElementType } from "react";
import type { BlockquoteProps } from "./blockquote.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { blockquoteVariants, blockquoteVariantMap } from "./blockquote.styles";
import { boxVariants, boxVariantMap } from "../../layout/box/box.styles";
import { BOX_VARIANT_KEYS } from "../../layout/box/box.keys";
import { identify } from "../../../utils/dev-identity";

const VARIANT_KEYS = Object.keys(blockquoteVariantMap);

/** A quotation block with a leading accent rule and optional `<cite>` attribution. */
const Blockquote = identify("Blockquote", function Blockquote<T extends ElementType = "blockquote">({
  as,
  className,
  children,
  cite,
  citeUrl,
  style,
  ref,
  ...props
}: BlockquoteProps<T>) {
  const Element: ElementType = as ?? "blockquote";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  const own = resolveStyleProps(variantProps, { maps: blockquoteVariantMap, variants: blockquoteVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      cite={citeUrl}
      className={astralisMerge(own.className, box.className, className)}
      ref={ref}
      style={{ ...own.style, ...box.style, ...style }}
      {...htmlProps}
    >
      {children}
      {cite != null && (
        <cite className="astralis:mt-2 astralis:block astralis:text-sm astralis:not-italic astralis:text-label-muted">
          {cite}
        </cite>
      )}
    </Element>
  );
});

export default Blockquote;
