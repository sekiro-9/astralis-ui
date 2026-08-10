import type { ElementType } from "react";
import type { FlexProps } from "../flex";
import type { ResponsiveProp } from "../../../utils/responsive";

export type StackDirection = "horizontal" | "vertical";

interface StackCustomProps {
  /**
   * Responsive, like every other style prop — `direction={{ base: "vertical",
   * md: "horizontal" }}` is the stack-on-mobile, row-on-desktop layout. Scalar
   * values still work; the default is `"vertical"`.
   */
  direction?: ResponsiveProp<StackDirection>;
}

export type StackProps<T extends ElementType = "div"> = StackCustomProps &
  Omit<FlexProps<T>, "direction">;
