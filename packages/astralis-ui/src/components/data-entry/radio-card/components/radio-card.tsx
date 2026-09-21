"use client";

import type { ChangeEvent, Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
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
import { identify } from "../../../../utils/dev-identity";

/**
 * A card-shaped radio — a whole clickable surface for rich single-select
 * choices (plans, tiers, shipping options). Joins `Radio.Group` the same way
 * `Radio` does: give it a `value` inside a group.
 */
export const RadioCard = identify("RadioCard", function RadioCard({
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
  id: idProp,
  ref,
  ...props
}: RadioCardProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useRadioGroupContext();
  const field = useFieldContext();

  const [localChecked, setLocalChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked });
  const isGroupMember = group != null && value != null;
  const isChecked = isGroupMember ? group.groupValue === String(value) : localChecked;

  const isDisabled = disabledProp ?? group?.disabled ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const id = idProp ?? (group ? undefined : field?.id);
  const name = nameProp ?? group?.name;
  const hue = colorScheme ?? group?.colorScheme ?? "brand";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isGroupMember) group.selectValue(String(value));
    else setLocalChecked(e.target.checked);
    onChangeProp?.(e);
  };

  const sz = selectionCardSizes[size];
  const { placementClass, rest } = splitPlacement(props);
  const { style, ...inputProps } = rest;

  return (
    <label
      className={astralisMerge(
        accentClass(hue),
        isDisabled ? "astralis:cursor-not-allowed astralis:opacity-moderate" : "astralis:cursor-pointer",
        placementClass,
        className,
      )}
      style={style}
    >
      <input
        ref={ref}
        type="radio"
        id={id}
        name={name}
        checked={isChecked}
        disabled={isDisabled}
        value={value}
        aria-invalid={isInvalid || undefined}
        required={field?.required}
        aria-describedby={group ? undefined : field?.describedBy}
        onChange={handleChange}
        className="astralis:sr-only astralis:peer"
        {...inputProps}
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
});
