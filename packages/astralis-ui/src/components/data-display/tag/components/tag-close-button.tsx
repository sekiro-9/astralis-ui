"use client";

import type { TagSize } from "../tag.types";
import { closeIconSize } from "../tag.styles";
import Icon from "../../../icon/icon";
import { XIcon } from "../../../icon/internal-icons";

/** The remove control, split out as a client leaf so a server-rendered Tag
 *  never puts an event handler on a host element. */
export function TagCloseButton({ label, size, onClose }: { label: string; size: TagSize; onClose?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }}
      className="astralis:shrink-0 astralis:inline-flex astralis:rounded-sm astralis:opacity-70 astralis:cursor-pointer astralis:transition-opacity astralis:hover:opacity-100 astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-1 astralis:focus-visible:outline-accent-ring"
    >
      <Icon size={closeIconSize[size]}>
        <XIcon />
      </Icon>
    </button>
  );
}

TagCloseButton.displayName = "Tag.CloseButton";
