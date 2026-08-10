import { forwardRef, type ElementType, type ReactNode, type Ref } from "react";
import type { StackDirection, StackProps } from "./stack.types";
import type { ResponsiveProp } from "../../../utils/responsive";
import Flex from "../flex";

/** Stack speaks in axes; Flex speaks in CSS. This is the only translation. */
const FLEX_DIRECTION = { vertical: "column", horizontal: "row" } as const;

/**
 * Maps a (possibly responsive) stack direction onto Flex's `direction`. A
 * breakpoint map is translated key by key rather than passed through, so
 * `direction={{ base: "vertical", md: "horizontal" }}` resolves the same way a
 * scalar does — Stack was the one style prop that couldn't be made responsive.
 */
function toFlexDirection(direction: ResponsiveProp<StackDirection>) {
  if (typeof direction === "string") return FLEX_DIRECTION[direction];

  const resolved: Record<string, string> = {};
  for (const bp in direction) {
    const value = (direction as Record<string, StackDirection>)[bp];
    if (value) resolved[bp] = FLEX_DIRECTION[value];
  }
  return resolved;
}

type StackComponent = <T extends ElementType = "div">(
  props: StackProps<T> & { ref?: Ref<any> },
) => ReactNode;

/** HStack/VStack are presets — `direction` is fixed, so it's omitted from their props. */
type StackPresetComponent = <T extends ElementType = "div">(
  props: Omit<StackProps<T>, "direction"> & { ref?: Ref<any> },
) => ReactNode;

const Stack = forwardRef(({ direction = "vertical", as, children, ...props }: StackProps<any>, ref: Ref<any>) => (
  <Flex
    ref={ref}
    as={as}
    direction={toFlexDirection(direction) as any}
    {...props}
  >
    {children}
  </Flex>
)) as unknown as StackComponent
(Stack as any).displayName = "Stack"

// HStack centres on the cross axis — that's the preset, and it's overridable
// because the spread comes after it. VStack deliberately sets nothing, so its
// children stretch to the column width exactly as raw CSS would have them.
// `direction` is forced last so it always wins over any spread prop.
export const HStack = forwardRef((props: Omit<StackProps<any>, "direction">, ref: Ref<any>) => (
  <Stack ref={ref} alignItems="center" {...props} direction="horizontal" />
)) as unknown as StackPresetComponent;
(HStack as any).displayName = "HStack";

export const VStack = forwardRef((props: Omit<StackProps<any>, "direction">, ref: Ref<any>) => (
  <Stack ref={ref} {...props} direction="vertical" />
)) as unknown as StackPresetComponent;
(VStack as any).displayName = "VStack";

export default Stack