import type { TableRowProps } from "../table.types";
import { useTable } from "../table.context";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function TableRow({ children, className = "", ...rest }: TableRowProps) {
  const { striped, interactive } = useTable();
  return (
    <tr
      className={astralisMerge(
        "astralis:transition-colors",
        striped ? "astralis:even:bg-surface-subtle" : "",
        // Hover is one step up from wherever the row rests. In a striped table
        // that differs by row, so the two cases are spelled out — otherwise the
        // banded rows would either not move or overshoot.
        interactive
          ? striped
            ? "astralis:odd:hover:bg-surface-subtle astralis:even:hover:bg-surface-muted"
            : "astralis:hover:bg-surface-subtle"
          : "",
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}
