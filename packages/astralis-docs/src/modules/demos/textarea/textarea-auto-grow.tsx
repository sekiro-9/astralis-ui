import { Box, Textarea } from "astralis-ui";

export function TextareaAutoGrow() {
  return (
    <Box w="full" maxW="md">
      <Textarea autoGrow rows={2} placeholder="Keep typing: the field grows with each new line" />
    </Box>
  );
}
