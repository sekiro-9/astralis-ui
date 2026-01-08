import { Icon } from "../../icon";
import { useStepsContext } from "./steps.context";
import type { StepProps } from "./steps.types";

export function Step({
  title,
  description,
  icon,
  disabled,
  index = 0,
}: StepProps) {
  const { value, clickable, onChange } = useStepsContext();

  const status =
    index < value ? "completed" : index === value ? "active" : "upcoming";

  const isClickable = clickable && !disabled && typeof onChange === "function";

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onChange(index)}
      className={[
        "astralis-flex astralis-items-start astralis-gap-3 astralis-text-left",
        disabled && "astralis-opacity-50",
      ].join(" ")}
    >
      {/* Indicator */}
      <div
        className={[
          "astralis-flex astralis-items-center astralis-justify-center",
          "astralis-rounded-full astralis-flex-shrink-0",
          "astralis-w-8 astralis-h-8",
          status === "completed" &&
            "astralis-bg-primary-600 astralis-text-white",
          status === "active" &&
            "astralis-border-2 astralis-border-primary-600",
          status === "upcoming" &&
            "astralis-border astralis-border-neutral-300",
        ].join(" ")}
      >
        {status === "completed" ? (
          <Icon name="Check" size="sm" />
        ) : (
          icon ?? index + 1
        )}
      </div>

      {/* Text */}
      <div className="astralis-flex astralis-flex-col">
        <span
          className={[
            "astralis-text-sm",
            status === "active" && "astralis-font-semibold",
          ].join(" ")}
        >
          {title}
        </span>

        {description && (
          <span className="astralis-text-xs astralis-text-neutral-500">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
