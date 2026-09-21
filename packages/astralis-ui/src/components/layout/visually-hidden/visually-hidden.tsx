import type { ComponentPropsWithoutRef } from "react";
import { astralisMerge } from "../../../utils/astralis-merge";
import { identify } from "../../../utils/dev-identity";

/**
 * Renders content for assistive technology only — visually removed from the
 * page but still announced by screen readers. The standard companion for
 * icon-only controls and skip-link patterns.
 */
export const VisuallyHidden = identify("VisuallyHidden", function VisuallyHidden({ className = "", ...rest }: ComponentPropsWithoutRef<"span">) {
  return <span className={astralisMerge("astralis:sr-only", className)} {...rest} />;
});
