import type { StepsIndicatorProps } from "../steps.types";
import { useStepsItem, useSteps } from "../steps.context";
import Icon from "../../../icon/icon";

export function StepsIndicator({ children }: StepsIndicatorProps) {
  const { index, state } = useStepsItem();
  const { size } = useSteps();

  const isSmall = size === "small";
  const sizeClasses = isSmall
    ? "astralis-h-6 astralis-w-6 astralis-text-xs"
    : "astralis-h-8 astralis-w-8 astralis-text-sm";

  const iconSize = isSmall ? "xs" : "sm";

  // Base classes
  const baseClasses =
    "astralis-flex astralis-items-center astralis-justify-center astralis-rounded-full astralis-font-medium astralis-transition-colors";

  // State-specific classes
  let stateClasses = "";
  let content = children ?? index + 1;

  switch (state) {
    case "finish":
      stateClasses = "astralis-bg-purple-500/30 astralis-text-purple-500";
      if (!children) content = <Icon name="Check" size={iconSize} />;
      break;
    case "error":
      stateClasses = "astralis-bg-error-500 astralis-text-white";
      if (!children) content = <Icon name="X" size={iconSize} />;
      break;
    case "process":
      stateClasses = "astralis-bg-purple-500 astralis-text-white";
      break;
    case "wait":
    default:
      stateClasses =
        "astralis-bg-surface-raised astralis-border astralis-border-border-subtle astralis-text-content-primary";
      break;
  }

  return (
    <div
      data-state={state}
      aria-current={state === "process" ? "step" : undefined}
      className="astralis-w-[20%]"
    >
      <div className={`${baseClasses} ${sizeClasses} ${stateClasses}`}>
        {content}
      </div>
    </div>
  );
}
