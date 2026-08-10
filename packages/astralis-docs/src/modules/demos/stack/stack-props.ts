import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with stack.types.ts */
export const stackProps: PropRow[] = [
  {
    prop: "direction",
    type: `"horizontal" | "vertical"`,
    default: `"vertical"`,
    description:
      "Stacking axis, responsive like every other style prop — direction={{ base: \"vertical\", md: \"horizontal\" }} is stack-on-mobile, row-on-desktop. HStack and VStack are presets with this fixed (HStack also centres on the cross axis).",
  },
  {
    prop: "gap",
    type: `"0" – "96" (spacing scale)`,
    description: "Space between children.",
  },
  {
    prop: "alignItems · justifyContent · wrap …",
    type: "Flex props",
    description: "Stack is a Flex preset — every Flex and Box prop works.",
  },
];
