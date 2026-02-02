import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../modal.context";
import type {
  ModalContentProps,
  ModalSize,
  ModalPlacement,
} from "../modal.types";

export function ModalContent({ children }: ModalContentProps) {
  const { open, setOpen, size, placement } = useModal();

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

  const placementClasses: Record<ModalPlacement, string> = {
    center: "astralis-items-center astralis-justify-center",
    top: "astralis-items-start astralis-justify-center astralis-pt-20",
    bottom: "astralis-items-end astralis-justify-center astralis-pb-20",
  };

  const sizeClasses: Record<ModalSize, string> = {
    xs: "astralis-w-full astralis-max-w-xs",
    sm: "astralis-w-full astralis-max-w-sm",
    md: "astralis-w-full astralis-max-w-md",
    lg: "astralis-w-full astralis-max-w-lg",
    xl: "astralis-w-full astralis-max-w-xl",
    full: "astralis-w-full astralis-h-full astralis-max-w-none astralis-rounded-none",
  };

  return createPortal(
    <div
      className={`astralis-fixed astralis-inset-0 astralis-z-50 astralis-flex ${placementClasses[placement]} astralis-pointer-events-none`}
    >
      <div
        className={`astralis-bg-surface-base astralis-text-content-primary astralis-shadow-lg astralis-pointer-events-auto astralis-flex astralis-flex-col astralis-max-h-[90vh] ${
          size === "full" ? "astralis-h-full" : "astralis-rounded-xl"
        } ${sizeClasses[size]}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
