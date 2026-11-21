"use client";

import { useState, type Ref } from "react";
import { InputBase } from "./input";
import type { InputPasswordProps } from "../input.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { EyeIcon, EyeOffIcon } from "../../../icon/internal-icons";
import { identify } from "../../../../utils/dev-identity";

export const InputPassword = identify("Input.Password", function InputPassword({
  className = "",
  style,
  disabled,
  ref,
  ...props
}: InputPasswordProps & { ref?: Ref<HTMLInputElement> }) {
  const [visible, setVisible] = useState(false);
  // Placement belongs on the wrapper: the toggle button is positioned against
  // it, so moving or sizing only the inner input would leave the button behind.
  const { placementClass, placementStyle, rest: inputProps } = splitPlacement(props);

  return (
    <div className={astralisMerge("astralis:relative astralis:flex astralis:items-center", placementClass)} style={placementStyle}>
      <div className="astralis:w-full">
        <InputBase
          ref={ref}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={astralisMerge("astralis:pr-10", className)}
          {...inputProps}
          style={style}
        />
      </div>
      <button
        type="button"
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="astralis:absolute astralis:right-3 astralis:z-10 astralis:flex astralis:items-center astralis:text-label-subtle astralis:transition-colors astralis:hover:text-label-muted astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate"
      >
        {visible ? (
          <EyeOffIcon className="astralis:h-4 astralis:w-4" aria-hidden="true" />
        ) : (
          <EyeIcon className="astralis:h-4 astralis:w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
