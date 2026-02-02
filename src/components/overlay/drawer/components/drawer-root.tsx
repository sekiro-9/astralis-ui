import { useCallback, useState } from "react";
import { DrawerContext } from "../drawer.context";
import type { DrawerProps, DrawerSize } from "../drawer.types";

export function DrawerRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  size = "md",
  children,
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange],
  );

  return (
    <DrawerContext.Provider value={{ open, setOpen, side, size }}>
      {children}
    </DrawerContext.Provider>
  );
}
