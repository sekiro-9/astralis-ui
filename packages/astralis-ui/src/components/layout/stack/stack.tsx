import type { ElementType } from "react";
import type { StackDirection, StackProps } from "./stack.types";
import type { ResponsiveKey, ResponsiveProp } from "../../../utils/responsive";
import Flex, { type FlexProps } from "../flex";

/** Stack speaks in axes; Flex speaks in CSS. This is the only translation. */
const FLEX_DIRECTION = { vertical: "column", horizontal: "row" } as const;

type FlexDirection = (typeof FLEX_DIRECTION)[StackDirection];

/** A breakpoint map is translated key by key, so a responsive direction
 *  resolves exactly like a scalar one. */
function toFlexDirection(direction: ResponsiveProp<StackDirection>): ResponsiveProp<FlexDirection> {
  if (typeof direction === "string") return FLEX_DIRECTION[direction];

  const resolved: Partial<Record<ResponsiveKey, FlexDirection>> = {};
  for (const bp in direction) {
    const value = direction[bp as ResponsiveKey];
    if (value) resolved[bp as ResponsiveKey] = FLEX_DIRECTION[value];
  }
  return resolved;
}

function Stack<T extends ElementType = "div">({ direction = "vertical", ...props }: StackProps<T>) {
  // `as` travels inside the spread, so the element type is still the caller's.
  return <Flex {...(props as FlexProps)} direction={toFlexDirection(direction)} />;
}

Stack.displayName = "Stack";

/** Props for the HStack/VStack presets — `direction` is fixed. */
type StackPresetProps<T extends ElementType> = Omit<StackProps<T>, "direction">;

// HStack centres on the cross axis — a preset, overridable because the spread
// comes after it. VStack sets nothing, so its children stretch as raw CSS
// would. `direction` is forced last so it always wins over any spread prop.
export function HStack<T extends ElementType = "div">(props: StackPresetProps<T>) {
  return <Stack alignItems="center" {...(props as StackPresetProps<"div">)} direction="horizontal" />;
}

HStack.displayName = "HStack";

export function VStack<T extends ElementType = "div">(props: StackPresetProps<T>) {
  return <Stack {...(props as StackPresetProps<"div">)} direction="vertical" />;
}

VStack.displayName = "VStack";

export default Stack;
