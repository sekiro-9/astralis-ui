import type { InputGroupProps } from "../input.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * Wraps an Input with prefix/suffix slots. The wrapper stamps presence
 * attributes and the Input carries parent-keyed padding variants on them —
 * no context, so the group itself is a Server Component (the Input inside is
 * client either way; it owns focus/typing).
 */
export function InputGroup({ prefix, suffix, children, className = "" }: InputGroupProps) {
  return (
    <div
      data-inputgroup-prefix={prefix ? "" : undefined}
      data-inputgroup-suffix={suffix ? "" : undefined}
      className={astralisMerge("astralis:relative astralis:flex astralis:items-center", className)}
    >
      {prefix && (
        <span className="astralis:absolute astralis:left-3 astralis:z-10 astralis:flex astralis:items-center astralis:text-label-subtle astralis:pointer-events-none">
          {prefix}
        </span>
      )}

      <div className="astralis:w-full">{children}</div>

      {suffix && (
        <span className="astralis:absolute astralis:right-3 astralis:z-10 astralis:flex astralis:items-center astralis:text-label-subtle">
          {suffix}
        </span>
      )}
    </div>
  );
}

InputGroup.displayName = "InputGroup";
