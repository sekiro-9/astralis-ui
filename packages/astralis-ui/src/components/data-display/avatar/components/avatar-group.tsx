import { Children, isValidElement } from "react";
import { avatarVariants } from "../avatar.styles";
import type { AvatarGroupProps } from "../avatar.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { inheritProps } from "../../../../utils/inherit-props";
import { AvatarRoot } from "./avatar-root";

export function AvatarGroup({ children, max, spacing = -8, size = "md", className = "", style }: AvatarGroupProps) {
  const all = Children.toArray(children).filter(isValidElement);
  const visible = max !== undefined ? all.slice(0, max) : all;
  const overflow = max !== undefined ? all.length - max : 0;

  return (
    <div className={astralisMerge("astralis:inline-flex astralis:items-center", className)} style={style}>
      {visible.map((child, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : spacing }}>
          {/* Size and the overlap ring are cloned into direct Avatar children
              (explicit props win) — no context, so the group is a Server
              Component and only Avatar's own image-fallback state is client. */}
          {inheritProps(child, new Map([[AvatarRoot, { size, ring: true }]]))}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={astralisMerge(
            avatarVariants({ size, shape: "circle" }),
            "astralis:bg-surface-muted astralis:text-label-muted astralis:ring-2 astralis:ring-surface-base",
          )}
          style={{ marginLeft: spacing }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = "Avatar.Group";
