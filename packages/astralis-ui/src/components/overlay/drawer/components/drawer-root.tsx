"use client";

import { useMemo } from "react";
import { DrawerContext, useDrawer } from "../drawer.context";
import type { DrawerProps, DrawerSlotProps } from "../drawer.types";
import { useDialogCore } from "../../dialog/dialog-core";
import { DialogClosePart, DialogTriggerPart } from "../../dialog/dialog-parts";
import { identify } from "../../../../utils/dev-identity";

export const DrawerRoot = identify("Drawer", function DrawerRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "right",
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: DrawerProps) {
  const core = useDialogCore({ open, defaultOpen, onOpenChange, closeOnOverlayClick, closeOnEsc });
  const ctx = useMemo(() => ({ ...core, placement, size }), [core, placement, size]);
  return <DrawerContext.Provider value={ctx}>{children}</DrawerContext.Provider>;
});

export const DrawerTrigger = identify("Drawer.Trigger", function DrawerTrigger(props: DrawerSlotProps) {
  const ctx = useDrawer();
  return <DialogTriggerPart ctx={ctx} {...props} />;
});

export const DrawerClose = identify("Drawer.Close", function DrawerClose(props: DrawerSlotProps) {
  const ctx = useDrawer();
  return <DialogClosePart ctx={ctx} {...props} />;
});
