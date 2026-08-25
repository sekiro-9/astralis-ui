import { SegmentedControl, Box } from "astralis-ui";

export function SegmentedControlFullWidth() {
  return (
    <Box w="full" maxW="md">
      <SegmentedControl fullWidth defaultValue="preview" aria-label="Mode">
        <SegmentedControl.Item value="edit">Edit</SegmentedControl.Item>
        <SegmentedControl.Item value="preview">Preview</SegmentedControl.Item>
      </SegmentedControl>
    </Box>
  );
}
