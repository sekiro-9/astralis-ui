import { SegmentedControl, VStack } from "astralis-ui";

export function SegmentedControlSizes() {
  return (
    <VStack gap="4" alignItems="start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl key={size} size={size} defaultValue="week" aria-label={`Range (${size})`}>
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
          <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        </SegmentedControl>
      ))}
    </VStack>
  );
}
