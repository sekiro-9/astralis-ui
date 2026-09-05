import { SegmentedControl as SegmentedControlRoot } from "./components/segmented-control";
import { SegmentedControlItem } from "./components/segmented-control-item";

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
});

export { SegmentedControlItem };

export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlSize,
  SegmentedControlContextValue,
} from "./segmented-control.types";
