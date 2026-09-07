import { astralisMerge } from "../../../utils/astralis-merge";
import { CheckIcon } from "../../icon/internal-icons";
import { optionRowClasses, type BaseOptionItem } from "./options";

export function OptionRow({
  option,
  isActive,
  isSelected,
  onPick,
  id,
}: {
  option: BaseOptionItem;
  isActive: boolean;
  isSelected: boolean;
  onPick: (value: string | number) => void;
  id?: string;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled || undefined}
      onMouseDown={(e) => {
        // mousedown so we beat the trigger's blur event
        e.preventDefault();
        if (!option.disabled) onPick(option.value);
      }}
      className={astralisMerge(
        "astralis:flex astralis:items-center astralis:justify-between astralis:gap-2",
        "astralis:px-3 astralis:py-2 astralis:rounded-lg astralis:text-sm astralis:cursor-pointer astralis:transition-colors",
        optionRowClasses(isActive, !!option.disabled),
        isSelected && "astralis:font-medium",
      )}
    >
      <span className="astralis:truncate">{option.label}</span>
      {isSelected && <CheckIcon aria-hidden="true" className="astralis:h-3.5 astralis:w-3.5 astralis:shrink-0 astralis:text-accent-solid" />}
    </div>
  );
}
