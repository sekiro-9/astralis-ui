"use client";

import { useId, useState } from "react";
import type { Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import type { RatingProps } from "../rating.types";
import { ratingSizes, ratingRoot, ratingStar, ratingStarColor } from "../rating.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { StarIcon } from "../../../icon/internal-icons";

/**
 * Star rating. Interactive mode is a radiogroup of native radios (sr-only), so
 * arrow keys, form participation and announcement come from the platform —
 * selection is whole stars. `readOnly` renders a static display where
 * fractional values (4.5) show as half-filled stars.
 */
export function Rating({
  max = 5,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onChange,
  size = "md",
  colorScheme = "yellow",
  readOnly: readOnlyProp,
  disabled: disabledProp,
  invalid: invalidProp,
  label,
  name: nameProp,
  className = "",
  ref,
  ...props
}: RatingProps & { ref?: Ref<HTMLDivElement> }) {
  const field = useFieldContext();
  const readOnly = readOnlyProp ?? field?.readOnly;
  const disabled = disabledProp ?? field?.disabled;
  const invalid = invalidProp ?? field?.invalid;

  const generatedName = useId();
  const name = nameProp ?? generatedName;

  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: (next: number) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const { placementClass, placementStyle, rest: domProps } = splitPlacement(props);
  const sz = ratingSizes[size];
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (readOnly) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={`${value} out of ${max} stars`}
        className={astralisMerge(ratingRoot, accentClass(colorScheme), placementClass, className)}
        style={placementStyle}
        {...domProps}
      >
        {stars.map((star) => {
          const fraction = Math.max(0, Math.min(1, value - (star - 1)));
          return (
            <span key={star} aria-hidden="true" className="astralis:relative astralis:inline-flex">
              <StarIcon className={astralisMerge(sz, ratingStarColor(false))} />
              {fraction > 0 && (
                // Partial fill: a clipped overlay star. Width is inline on
                // purpose — fraction utilities don't emit from dynamic values.
                <span
                  className="astralis:absolute astralis:inset-0 astralis:overflow-hidden"
                  style={{ width: `${fraction * 100}%` }}
                >
                  <StarIcon fill="currentColor" className={astralisMerge(sz, ratingStarColor(true))} />
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  const displayValue = hoverValue ?? value;
  const labelledBy = label ? undefined : field?.labelledBy;

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={labelledBy ? undefined : (label ?? "Rating")}
      aria-labelledby={labelledBy}
      aria-describedby={field?.describedBy}
      aria-invalid={invalid || undefined}
      aria-required={field?.required || undefined}
      onMouseLeave={() => setHoverValue(null)}
      className={astralisMerge(
        ratingRoot,
        accentClass(colorScheme),
        disabled && "astralis:opacity-moderate",
        placementClass,
        className,
      )}
      style={placementStyle}
      {...domProps}
    >
      {stars.map((star) => {
        const filled = star <= displayValue;
        return (
          <label
            key={star}
            onMouseEnter={disabled ? undefined : () => setHoverValue(star)}
            className={disabled ? "astralis:cursor-not-allowed" : "astralis:cursor-pointer"}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              disabled={disabled}
              required={field?.required}
              onChange={() => setValue(star)}
              aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
              className="astralis:sr-only astralis:peer"
            />
            <span className={ratingStar}>
              <StarIcon fill={filled ? "currentColor" : "none"} className={astralisMerge(sz, ratingStarColor(filled, !!invalid))} />
            </span>
          </label>
        );
      })}
    </div>
  );
}

Rating.displayName = "Rating";
