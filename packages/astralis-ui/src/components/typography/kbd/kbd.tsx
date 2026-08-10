import { splitPlacement } from "../../../utils/placement";
import { astralisMerge } from "../../../utils/astralis-merge";
import { kbdVariants } from "./kbd.styles";
import type { KbdProps } from "./kbd.types";

/** A keyboard-key cap: `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`. Renders a semantic `<kbd>`. */
export function Kbd({ size, className = "", children, ref, ...rest }: KbdProps) {
  const { placementClass, rest: domProps } = splitPlacement(rest);

  return (
    <kbd ref={ref} className={astralisMerge(kbdVariants({ size }), placementClass, className)} {...domProps}>
      {children}
    </kbd>
  );
}

Kbd.displayName = "Kbd";
