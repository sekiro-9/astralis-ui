"use client";

import type { ChangeEvent, Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useCheckboxGroupContext } from "../../checkbox/checkbox.context";
import { useFieldContext } from "../../field/field.context";
import type { CheckboxCardProps } from "../checkbox-card.types";
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
 * A card-shaped checkbox — a whole clickable surface for rich multi-select
 * choices (plans, permissions, features). Joins `Checkbox.Group` the same way
 * `Checkbox` does: give it a `value` inside a group.
 */
export const CheckboxCard = identify("CheckboxCard", function CheckboxCard({
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
  className = "",
  id: idProp,
  ref,
  ...props
}: CheckboxCardProps & { ref?: Ref<HTMLInputElement> }) {
  const group = useCheckboxGroupContext();
  const field = useFieldContext();

  const [localChecked, setLocalChecked] = useControllableState({ value: checkedProp, defaultValue: defaultChecked });
  const isGroupMember = group != null && value != null;
  const isChecked = isGroupMember ? group.groupValue.includes(String(value)) : localChecked;

  const isDisabled = disabledProp ?? group?.disabled ?? field?.disabled;
  const isInvalid = invalidProp ?? field?.invalid;
  const id = idProp ?? (group ? undefined : field?.id);
  const hue = colorScheme ?? group?.colorScheme ?? "brand";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isGroupMember) group.toggleValue(String(value));
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
        type="checkbox"
        id={id}
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
