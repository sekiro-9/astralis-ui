"use client";

import { useDrawer } from "../drawer.context";
import type { DrawerContentProps } from "../drawer.types";
import { drawerBackdropClasses, drawerPanelVariants, drawerSizeStyle, drawerClosedTransform, SCRIM_COLOR } from "../drawer.styles";
import { Portal } from "../../portal";
import { useDialogPanel } from "../../dialog/dialog-core";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { identify } from "../../../../utils/dev-identity";

const DURATION = 250;

export const DrawerContent = identify("Drawer.Content", function DrawerContent({ children, className = "", style, ref, ...rest }: DrawerContentProps) {
  const ctx = useDrawer();
  const { placement, size } = ctx;
  const { mounted, isOpen, containerRef, backdropProps, panelProps } = useDialogPanel(ctx, { duration: DURATION });
  const panelRef = useMergedRefs(containerRef, ref);

  if (!mounted) return null;

  return (
    <Portal>
      <div
        {...backdropProps}
        className={`${drawerBackdropClasses} astralis:transition-opacity ${isOpen ? "astralis:opacity-100" : "astralis:opacity-0"}`}
        style={{ backgroundColor: SCRIM_COLOR, transitionDuration: `${DURATION}ms` }}
      />
      <div
        {...panelProps}
        {...rest}
        ref={panelRef}
        className={astralisMerge(
          drawerPanelVariants({ placement }),
          "astralis:transition-transform astralis:ease-out",
          isOpen ? "astralis:translate-x-0 astralis:translate-y-0" : drawerClosedTransform[placement],
          className,
        )}
        style={{ ...drawerSizeStyle(placement, size), transitionDuration: `${DURATION}ms`, ...style }}
      >
        {children}
      </div>
    </Portal>
  );
});
