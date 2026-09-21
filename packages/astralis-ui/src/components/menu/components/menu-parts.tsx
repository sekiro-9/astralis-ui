"use client";

import type { KeyboardEvent } from "react";
import { useMenu } from "../menu.context";
import type { MenuItemProps, MenuSectionProps, MenuTriggerProps } from "../menu.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { useMergedRefs } from "../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef } from "../../overlay/slot";
import {
  menuItemClasses,
  menuItemDangerClasses,
  menuLabelClasses,
  menuSeparatorClasses,
  menuIconSlotClasses,
  menuShortcutClasses,
} from "../menu.styles";
import { identify } from "../../../utils/dev-identity";

export const MenuTrigger = identify("Menu.Trigger", function MenuTrigger({ children, ref, ...rest }: MenuTriggerProps) {
  const { toggle, open, setOpen, triggerRef, contentId, focusIntentRef } = useMenu();
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(triggerRef, ref, slotChildRef(child));
  return cloneSlot(child, rest, {
    ref: mergedRef,
    onClick: () => {
      focusIntentRef.current = "first";
      toggle();
    },
    // APG menu button: ArrowDown opens on the first item, ArrowUp on the last.
    onKeyDown: (e: KeyboardEvent) => {
      if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
      e.preventDefault();
      focusIntentRef.current = e.key === "ArrowUp" ? "last" : "first";
      setOpen(true);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
  });
});

export const MenuItem = identify("Menu.Item", function MenuItem({
  onSelect,
  disabled = false,
  danger = false,
  icon,
  shortcut,
  closeOnSelect,
  className = "",
  children,
  ...rest
}: MenuItemProps) {
  const menu = useMenu();
  const shouldClose = closeOnSelect ?? menu.closeOnSelect;

  const activate = () => {
    if (disabled) return;
    onSelect?.();
    if (shouldClose) menu.close();
  };

  return (
    <div
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-astralis-menu-item=""
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      // Menus focus on hover so pointer and keyboard share one highlight.
      onPointerMove={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).focus();
      }}
      className={astralisMerge(menuItemClasses, danger && menuItemDangerClasses, className)}
      {...rest}
    >
      {icon && (
        <span aria-hidden="true" className={menuIconSlotClasses}>
          {icon}
        </span>
      )}
      <span className="astralis:flex-1 astralis:truncate">{children}</span>
      {shortcut && <span className={menuShortcutClasses}>{shortcut}</span>}
    </div>
  );
});

export const MenuLabel = identify("Menu.Label", function MenuLabel({ className = "", children, ...rest }: MenuSectionProps) {
  return (
    <div className={astralisMerge(menuLabelClasses, className)} {...rest}>
      {children}
    </div>
  );
});

export const MenuSeparator = identify("Menu.Separator", function MenuSeparator({ className = "", ...rest }: MenuSectionProps) {
  return <div role="separator" aria-orientation="horizontal" className={astralisMerge(menuSeparatorClasses, className)} {...rest} />;
});

export const MenuGroup = identify("Menu.Group", function MenuGroup({ className = "", children, ...rest }: MenuSectionProps) {
  return (
    <div role="group" className={className || undefined} {...rest}>
      {children}
    </div>
  );
});
