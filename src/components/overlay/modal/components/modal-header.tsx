import type { ModalHeaderProps } from "../modal.types";
import Icon from "../../../icon/icon";
import { ModalClose } from "./modal-close";

export function ModalHeader({ children }: ModalHeaderProps) {
  return (
    <div className="astralis-flex astralis-items-center astralis-justify-between astralis-text-lg astralis-font-semibold astralis-border-b astralis-border-border-subtle astralis-p-4">
      {children}
      <ModalClose>
        <button className="astralis-text-content-secondary hover:astralis-text-content-primary astralis-transition-colors">
          <Icon name="X" size="md" />
        </button>
      </ModalClose>
    </div>
  );
}
