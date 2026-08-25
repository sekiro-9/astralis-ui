"use client";

import { splitPlacement } from "../../../../utils/placement";
import { useEffect, useState } from "react";
import type { ChangeEvent, Ref } from "react";
import { useRadioGroupContext } from "../../radio/radio.context";
import { useFieldContext } from "../../field/field.context";
import type { RadioCardProps } from "../radio-card.types";
import {
  selectionCardSizes,
  selectionCard,
  selectionCardColor,
  selectionCardIndicator,
  selectionCardTitle,
  selectionCardDescription,
} from "../../shared/selection-card.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass } from "../../../../const/color-schemes";
import { CheckIcon } from "../../../icon/internal-icons";

/**
 * A card-shaped radio — a whole clickable surface for rich single-select
 * choices (plans, tiers, shipping options). Joins `Radio.Group` the same way
 * `Radio` does: give it a `value` inside a group.
 */
export function RadioCard({
  children,
  description,
  addon,
  indicator = true,
  size = "md",
  colorScheme,
  invalid: invalidProp,
  disabled: disabledProp,
  checked: checkedProp,
  defaultChecked = false,
  onChange: onChangeProp,
  value,
  name: nameProp,
  className = "",
  ref,
  ...props
}: RadioCardProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useRadioGroupContext();
  const field = useFieldContext();

  const [localChecked, setLocalChecked] = useState(defaultChecked);
  const isGroupMember = group != null && value != null;
  const isControlled = checkedProp !== undefined;

  const isChecked: boolean = isGroupMember
    ? group.groupValue === String(value)
    : isControlled
      ? checkedProp!
      : localChecked;

  const isDisabled = disabledProp ?? group?.disabled ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const name = nameProp ?? group?.name;
  const hue = colorScheme ?? group?.colorScheme ?? "brand";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isGroupMember) group.selectValue(String(value));
    else if (!isControlled) setLocalChecked(e.target.checked);
    onChangeProp?.(e);
  };

  useEffect(() => {
    if (isControlled) setLocalChecked(checkedProp!);
  }, [isControlled, checkedProp]);

  const sz = selectionCardSizes[size];
  const { placementClass, placementStyle, rest: domProps } = splitPlacement(props);

  return (
    <label
      className={astralisMerge(
        accentClass(hue),
        isDisabled ? "astralis:cursor-not-allowed astralis:opacity-moderate" : "astralis:cursor-pointer",
        placementClass,
        className,
      )}
      style={placementStyle}
    >
      <input
        ref={ref}
        type="radio"
        name={name}
        checked={isChecked}
        disabled={isDisabled}
        value={value}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        onChange={handleChange}
        className="astralis:sr-only astralis:peer"
        {...domProps}
      />
      <span className={astralisMerge(sz.card, selectionCard, selectionCardColor(isChecked, !!isInvalid))}>
        {addon && <span className="astralis:shrink-0">{addon}</span>}
        <span className="astralis:flex astralis:flex-col astralis:min-w-0">
          {children && <span className={astralisMerge(sz.title, selectionCardTitle)}>{children}</span>}
          {description && (
            <span className={astralisMerge(sz.description, selectionCardDescription)}>{description}</span>
          )}
        </span>
        {indicator && isChecked && (
          <span aria-hidden="true" className={selectionCardIndicator}>
            <CheckIcon />
          </span>
        )}
      </span>
    </label>
  );
}

RadioCard.displayName = "RadioCard";
