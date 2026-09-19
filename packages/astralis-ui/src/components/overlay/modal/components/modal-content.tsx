"use client";

import { useModal } from "../modal.context";
import type { ModalContentProps } from "../modal.types";
import { modalViewportVariants, modalBackdropClasses, modalPanelVariants, SCRIM_COLOR } from "../modal.styles";
import { Portal } from "../../portal";
import { useDialogPanel } from "../../dialog/dialog-core";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useMergedRefs } from "../../../../utils/merge-refs";

const DURATION = 200;

export function ModalContent({ children, className = "", style, ref, ...rest }: ModalContentProps) {
  const ctx = useModal();
  const { mounted, isOpen, containerRef, backdropProps, panelProps } = useDialogPanel(ctx, {
    duration: DURATION,
    role: ctx.role,
  });
  const panelRef = useMergedRefs(containerRef, ref);

  if (!mounted) return null;

  return (
    <Portal>
      <div className={modalViewportVariants({ centered: ctx.centered })}>
        <div
          {...backdropProps}
          className={`${modalBackdropClasses} astralis:transition-opacity ${isOpen ? "astralis:opacity-100" : "astralis:opacity-0"}`}
          style={{ backgroundColor: SCRIM_COLOR, transitionDuration: `${DURATION}ms` }}
        />
        <div
          {...panelProps}
          {...rest}
          ref={panelRef}
          className={astralisMerge(
            modalPanelVariants({ size: ctx.size }),
            "astralis:outline-none astralis:transition-all",
            isOpen ? "astralis:opacity-100 astralis:scale-100 astralis:translate-y-0" : "astralis:opacity-0 astralis:scale-95 astralis:translate-y-2",
            className,
          )}
          style={{ transitionDuration: `${DURATION}ms`, ...style }}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}
ModalContent.displayName = "Modal.Content";
