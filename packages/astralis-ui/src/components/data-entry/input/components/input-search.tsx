"use client";

import { useRef } from "react";
import type { KeyboardEvent, Ref } from "react";
import { InputBase } from "./input";
import { inputEndRounded } from "../input.styles";
import { useFieldContext } from "../../field/field.context";
import { useMergedRefs } from "../../../../utils/merge-refs";
import type { InputSearchProps } from "../input.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { accentClass } from "../../../../const/color-schemes";
import { SearchIcon } from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

export const InputSearch = identify("Input.Search", function InputSearch({
  onSearch,
  showSearchButton = false,
  colorScheme,
  className = "",
  style,
  onKeyDown,
  ref,
  ...rest
}: InputSearchProps & { ref?: Ref<HTMLInputElement> }) {
  // Placement belongs on the wrapper: the icon and button are positioned
  // against it, so moving or sizing only the inner input would leave them behind.
  const { placementClass, placementStyle, rest: props } = splitPlacement(rest);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  const field = useFieldContext();

  const isDisabled = props.disabled ?? field?.disabled;
  const isReadOnly = props.readOnly ?? field?.readOnly;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (e.key === "Enter") onSearch?.(e.currentTarget.value);
    onKeyDown?.(e);
  };

  const handleSearchClick = () => {
    if (isDisabled || isReadOnly) return;
    onSearch?.(inputRef.current?.value ?? "");
  };

  return (
    <div
      className={astralisMerge("astralis:relative astralis:flex astralis:items-center", colorScheme && accentClass(colorScheme), placementClass)}
      style={placementStyle}
    >
      <span className="astralis:absolute astralis:left-3 astralis:z-10 astralis:flex astralis:items-center astralis:text-label-subtle astralis:pointer-events-none">
        <SearchIcon className="astralis:h-4 astralis:w-4" aria-hidden="true" />
      </span>

      <div className="astralis:w-full">
        <InputBase
          ref={mergedRef}
          type="search"
          onKeyDown={handleKeyDown}
          className={astralisMerge("astralis:pl-9", showSearchButton && "astralis:rounded-r-none", className)}
          {...props}
          style={style}
        />
      </div>

      {showSearchButton && (
        <button
          type="button"
          disabled={!!isDisabled || !!isReadOnly}
          onClick={handleSearchClick}
          className={astralisMerge(
            "astralis:h-10 astralis:shrink-0 astralis:bg-accent-solid",
            inputEndRounded[props.rounded ?? "lg"],
            "astralis:px-4 astralis:text-sm astralis:font-medium astralis:text-accent-contrast astralis:transition-opacity astralis:hover:opacity-higher astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate",
          )}
        >
          Search
        </button>
      )}
    </div>
  );
});
