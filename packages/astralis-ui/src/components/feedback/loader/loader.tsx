import { splitPlacement } from "../../../utils/placement";
import type { Ref } from "react";
import type { LoaderProps } from "./loader.types";
import { loaderVariants } from "./loader.styles";
import { LOADER_GLYPHS } from "./loader-glyphs";
import { astralisMerge } from "../../../utils/astralis-merge";
import { accentClass } from "../../../const/color-schemes";
import { identify } from "../../../utils/dev-identity";

/**
 * An indeterminate loading indicator. Announces itself as a live status
 * region with a visually-hidden label; the animation keeps running under
 * prefers-reduced-motion because it conveys state, not decoration.
 */
export const Loader = identify("Loader", function Loader({
  variant = "blocks",
  size = "md",
  colorScheme = "brand",
  label = "Loading…",
  className = "",
  ref,
  ...rest
}: LoaderProps & { ref?: Ref<HTMLSpanElement> }) {
  const { placementClass, rest: domProps } = splitPlacement(rest);
  const Glyph = LOADER_GLYPHS[variant];

  return (
    <span
      ref={ref}
      role="status"
      data-variant={variant}
      className={astralisMerge(loaderVariants({ size }), accentClass(colorScheme), placementClass, className)}
      {...domProps}
    >
      <Glyph />
      {label ? <span className="astralis:sr-only">{label}</span> : null}
    </span>
  );
});
