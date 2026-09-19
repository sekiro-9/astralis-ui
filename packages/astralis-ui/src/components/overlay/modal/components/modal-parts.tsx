"use client";

import type { Ref } from "react";
import { useModal } from "../modal.context";
import type { ModalCloseButtonProps, ModalSectionProps } from "../modal.types";
import { DialogDescriptionPart, DialogTitlePart } from "../../dialog/dialog-parts";
import { astralisMerge } from "../../../../utils/astralis-merge";
import Icon from "../../../icon/icon";
import { XIcon } from "../../../icon/internal-icons";

export function ModalHeader({ className = "", ref, ...rest }: ModalSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge("astralis:flex astralis:flex-col astralis:gap-1 astralis:px-6 astralis:pt-6 astralis:pb-2", className)}
    />
  );
}
ModalHeader.displayName = "Modal.Header";

export function ModalBody({ className = "", ref, ...rest }: ModalSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge("astralis:px-6 astralis:py-4 astralis:text-label-muted", className)}
    />
  );
}
ModalBody.displayName = "Modal.Body";

export function ModalFooter({ className = "", ref, ...rest }: ModalSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:justify-end astralis:gap-3 astralis:px-6 astralis:pt-2 astralis:pb-6",
        className,
      )}
    />
  );
}
ModalFooter.displayName = "Modal.Footer";

export function ModalTitle(props: ModalSectionProps) {
  const ctx = useModal();
  return <DialogTitlePart ctx={ctx} {...props} />;
}
ModalTitle.displayName = "Modal.Title";

export function ModalDescription(props: ModalSectionProps) {
  const ctx = useModal();
  return <DialogDescriptionPart ctx={ctx} {...props} />;
}
ModalDescription.displayName = "Modal.Description";

/** The corner ✕ button — place inside a Header. */
export function ModalCloseButton({ className = "", onClick, ...rest }: ModalCloseButtonProps) {
  const { close } = useModal();
  return (
    <button
      type="button"
      aria-label="Close"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        close();
      }}
      className={astralisMerge(
        "astralis:absolute astralis:top-4 astralis:right-4 astralis:inline-flex astralis:items-center astralis:justify-center astralis:size-8 astralis:rounded-md astralis:text-label-muted astralis:cursor-pointer astralis:transition-colors astralis:hover:bg-surface-subtle astralis:hover:text-label-base astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
        className,
      )}
    >
      <Icon size="sm">
        <XIcon />
      </Icon>
    </button>
  );
}
ModalCloseButton.displayName = "Modal.CloseButton";
