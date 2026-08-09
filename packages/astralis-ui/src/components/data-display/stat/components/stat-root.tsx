import type { Ref } from "react";
import type { StatProps } from "../stat.types";
import { StatContext } from "../stat.context";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";

export function StatRoot({
  children,
  className = "",
  ref,
  ...props
}: StatProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest } = splitPlacement(props);

  return (
    <StatContext.Provider value={{}}>
      <div
        ref={ref}
        className={astralisMerge(
          "astralis:flex astralis:flex-col astralis:gap-1",
          placementClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </StatContext.Provider>
  );
}

StatRoot.displayName = "Stat.Root";
