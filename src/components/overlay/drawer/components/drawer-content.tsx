import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDrawer } from "../drawer.context";
import type { DrawerContentProps, DrawerSize } from "../drawer.types";

export function DrawerContent({ children }: DrawerContentProps) {
  const { open, setOpen, side, size } = useDrawer();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  const base =
    "astralis-fixed astralis-z-50 astralis-bg-surface-base astralis-text-content-primary astralis-shadow-lg astralis-transition-transform astralis-duration-300";

  // Map abstract sizes to specific Tailwind classes for width/height based on orientation
  const widthMap: Record<DrawerSize, string> = {
    xs: "astralis-w-[20rem]",
    sm: "astralis-w-[24rem]",
    md: "astralis-w-[28rem]",
    lg: "astralis-w-[32rem]",
    xl: "astralis-w-[36rem]",
    full: "astralis-w-full",
  };

  const heightMap: Record<DrawerSize, string> = {
    xs: "astralis-h-[20rem]",
    sm: "astralis-h-[24rem]",
    md: "astralis-h-[28rem]",
    lg: "astralis-h-[32rem]",
    xl: "astralis-h-[36rem]",
    full: "astralis-h-full",
  };

  const sideStyles = {
    right: `${base} astralis-right-0 astralis-top-0 astralis-h-full ${widthMap[size]} astralis-max-w-[100vw]`,
    left: `${base} astralis-left-0 astralis-top-0 astralis-h-full ${widthMap[size]} astralis-max-w-[100vw]`,
    bottom: `${base} astralis-bottom-0 astralis-left-0 astralis-w-full ${heightMap[size]} astralis-max-h-[100vh]`,
    top: `${base} astralis-top-0 astralis-left-0 astralis-w-full ${heightMap[size]} astralis-max-h-[100vh]`,
  };

  return createPortal(
    <div className={sideStyles[side]}>{children}</div>,
    document.body,
  );
}
