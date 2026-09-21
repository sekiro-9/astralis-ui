"use client";

import type { Ref } from "react";
import { useDrawer } from "../drawer.context";
import type { DrawerCloseButtonProps, DrawerSectionProps } from "../drawer.types";
import { DialogDescriptionPart, DialogTitlePart } from "../../dialog/dialog-parts";
import { astralisMerge } from "../../../../utils/astralis-merge";
import Icon from "../../../icon/icon";
import { XIcon } from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

export const DrawerHeader = identify("Drawer.Header", function DrawerHeader({ className = "", ref, ...rest }: DrawerSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:justify-between astralis:gap-4 astralis:px-6 astralis:py-4 astralis:border-b astralis:border-stroke-subtle",
        className,
      )}
    />
  );
});

export const DrawerBody = identify("Drawer.Body", function DrawerBody({ className = "", ref, ...rest }: DrawerSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge("astralis:flex-1 astralis:overflow-y-auto astralis:px-6 astralis:py-4 astralis:text-label-muted", className)}
    />
  );
});

export const DrawerFooter = identify("Drawer.Footer", function DrawerFooter({ className = "", ref, ...rest }: DrawerSectionProps) {
  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:justify-end astralis:gap-3 astralis:px-6 astralis:py-4 astralis:border-t astralis:border-stroke-subtle",
        className,
      )}
    />
  );
});

export const DrawerTitle = identify("Drawer.Title", function DrawerTitle(props: DrawerSectionProps) {
  const ctx = useDrawer();
  return <DialogTitlePart ctx={ctx} {...props} />;
});

export const DrawerDescription = identify("Drawer.Description", function DrawerDescription(props: DrawerSectionProps) {
  const ctx = useDrawer();
  return <DialogDescriptionPart ctx={ctx} {...props} />;
});

export const DrawerCloseButton = identify("Drawer.CloseButton", function DrawerCloseButton({ className = "", onClick, ...rest }: DrawerCloseButtonProps) {
  const { close } = useDrawer();
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
        "astralis:inline-flex astralis:items-center astralis:justify-center astralis:size-8 astralis:rounded-md astralis:text-label-muted astralis:cursor-pointer astralis:transition-colors astralis:hover:bg-surface-subtle astralis:hover:text-label-base astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
        className,
      )}
    >
      <Icon size="sm">
        <XIcon />
      </Icon>
    </button>
  );
});
