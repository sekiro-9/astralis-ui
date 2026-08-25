import { SegmentedControl } from "astralis-ui";

export function SegmentedControlDemo() {
  return (
    <SegmentedControl defaultValue="list" aria-label="View">
      <SegmentedControl.Item value="list">List</SegmentedControl.Item>
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
    </SegmentedControl>
  );
}
