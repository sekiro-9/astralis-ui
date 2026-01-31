import type { TabsTriggerProps } from "../tabs.types";
import { useTabs } from "../tabs.context";

export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
}: TabsTriggerProps) {
  const { value: activeValue, setValue, orientation } = useTabs();
  const active = value === activeValue;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      aria-disabled={disabled}
      data-state={active ? "active" : "inactive"}
      data-orientation={orientation}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      onClick={() => !disabled && setValue(value)}
      className={[
        "astralis-group astralis-flex astralis-items-center astralis-justify-center astralis-gap-2",
        "astralis-whitespace-nowrap astralis-px-4 astralis-py-2 astralis-text-sm astralis-font-medium",
        "astralis-transition-all astralis-outline-none focus-visible:astralis-ring-2 focus-visible:astralis-ring-purple-500",
        disabled
          ? "astralis-opacity-50 astralis-cursor-not-allowed"
          : "astralis-cursor-pointer",
        // Orientation specific styles
        orientation === "horizontal"
          ? [
              "astralis-border-b-2",
              active
                ? "astralis-border-purple-600 astralis-text-purple-600"
                : "astralis-border-transparent astralis-text-content-secondary hover:astralis-text-content-primary hover:astralis-border-border-subtle",
            ].join(" ")
          : [ 
              "astralis-border-r-2 astralis-w-full astralis-justify-start",
              active
                ? "astralis-border-purple-600 astralis-text-purple-600 astralis-bg-surface-raised"
                : "astralis-border-transparent astralis-text-content-secondary hover:astralis-text-content-primary hover:astralis-bg-surface-overlay",
            ].join(" "),
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
