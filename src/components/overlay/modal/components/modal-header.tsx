// modal-header.tsx
import type { ModalHeaderProps } from "../modal.types";

export function ModalHeader({ children }: ModalHeaderProps) {
  return (
    <div className="astralis-flex astralis-items-center astralis-justify-between astralis-text-lg astralis-font-semibold astralis-border-b astralis-border-border-subtle astralis-p-4">
      {children}
    </div>
  );
}
