import { Box, Text } from "astralis-ui";

export function BoxDemo() {
  return (
    <Box bg="subtle" p="6" rounded="xl" border="normal" borderColor="base" shadow="sm" maxW="sm">
      <Text weight="semibold">A humble Box</Text>
      <Text size="sm" color="muted">
        Every layout primitive in Astralis builds on this — spacing, sizing,
        color, borders and radius as typed token props.
      </Text>
    </Box>
  );
}
