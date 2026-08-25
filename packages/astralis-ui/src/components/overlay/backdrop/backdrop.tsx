import type { ComponentPropsWithoutRef } from "react";
import { astralisMerge } from "../../../utils/astralis-merge";
import { SCRIM_COLOR } from "../modal/modal.styles";

export interface BackdropProps extends ComponentPropsWithoutRef<"div"> {
  /** Frost the content behind the scrim. @default true */
  blur?: boolean;
}

/**
 * The full-screen scrim Modal and Drawer paint behind their panels, as a
 * standalone primitive — for blocking states, image viewers, and custom
 * overlays. Purely presentational: render it to show it; mounting, transitions
 * and dismissal belong to the caller.
 */
export function Backdrop({ blur = true, className = "", style, children, ...rest }: BackdropProps) {
  return (
    <div
      className={astralisMerge(
        "astralis:fixed astralis:inset-0 astralis:z-high",
        blur && "astralis:backdrop-blur-sm",
        children && "astralis:flex astralis:items-center astralis:justify-center",
        className,
      )}
      // Scrim colour is set inline (opacity-modifier utilities don't emit here).
      style={{ backgroundColor: SCRIM_COLOR, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

Backdrop.displayName = "Backdrop";
