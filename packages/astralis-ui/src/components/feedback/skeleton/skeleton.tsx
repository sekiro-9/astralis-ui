import { splitPlacement } from "../../../utils/placement";
import type { Ref } from "react";
import type { SkeletonProps } from "./skeleton.types";
import { skeletonVariants } from "./skeleton.styles";
import { astralisMerge } from "../../../utils/astralis-merge";
import { identify } from "../../../utils/dev-identity";

/**
 * A pulsing placeholder that holds space while content loads. Hidden from
 * assistive tech (`aria-hidden`) — pair the surrounding region with
 * `aria-busy` or a Loader if the loading state itself must be announced.
 */
export const Skeleton = identify("Skeleton", function Skeleton({
  variant = "text",
  animated = true,
  loaded = false,
  className = "",
  children,
  ref,
  ...rest
}: SkeletonProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest: domProps } = splitPlacement(rest);

  if (loaded) return <>{children}</>;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={astralisMerge(skeletonVariants({ variant, animated }), placementClass, className)}
      {...domProps}
    />
  );
});
