import { SegmentedControl as SegmentedControlRoot } from "./components/segmented-control";
import { SegmentedControlItem } from "./components/segmented-control-item";

// 1️⃣ Compound API
export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
});

// 2️⃣ Flat exports
export { SegmentedControlItem };

// 3️⃣ Type exports
export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlSize,
  SegmentedControlContextValue,
} from "./segmented-control.types";
