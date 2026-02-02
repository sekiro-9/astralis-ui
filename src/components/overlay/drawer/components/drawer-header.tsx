import type { DrawerHeaderProps } from "../drawer.types";
import Icon from "../../../icon/icon";
import { DrawerClose } from "./drawer-close";

export function DrawerHeader({ children }: DrawerHeaderProps) {
  return (
    <div className="astralis-flex astralis-items-center astralis-justify-between astralis-text-lg astralis-font-semibold astralis-border-b astralis-border-border-subtle astralis-p-4">
      {children}
      <DrawerClose>
        <button className="astralis-text-content-secondary hover:astralis-text-content-primary astralis-transition-colors">
          <Icon name="X" size="md" />
        </button>
      </DrawerClose>
    </div>
  );
}
