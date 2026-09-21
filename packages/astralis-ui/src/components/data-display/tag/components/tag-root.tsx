import type { Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import type { TagProps } from "../tag.types";
import { tagVariants } from "../tag.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { TagCloseButton } from "./tag-close-button";
import { identify } from "../../../../utils/dev-identity";

export const TagRoot = identify("Tag", function TagRoot({
  children,
  size = "md",
  variant = "subtle",
  colorScheme = "gray",
  startElement,
  endElement,
  closable,
  onClose,
  closeLabel,
  className = "",
  ref,
  ...rest
}: TagProps & { ref?: Ref<HTMLSpanElement> }) {
  // `style` rides through splitPlacement's fold (channel vars first, user
  // keys last) and arrives via the domProps spread.
  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <span
      ref={ref}
      className={astralisMerge(tagVariants({ size, variant }), accentClass(colorScheme), placementClass, className)}
      {...domProps}
    >
      {startElement && <span className="astralis:shrink-0 astralis:inline-flex">{startElement}</span>}
      <span className="astralis:truncate">{children}</span>
      {endElement && !closable && <span className="astralis:shrink-0 astralis:inline-flex">{endElement}</span>}
      {closable && (
        <TagCloseButton
          size={size}
          onClose={onClose}
          label={closeLabel ?? (typeof children === "string" || typeof children === "number" ? `Remove ${children}` : "Remove")}
        />
      )}
    </span>
  );
});
