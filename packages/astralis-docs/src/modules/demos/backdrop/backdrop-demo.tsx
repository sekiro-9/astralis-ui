import { Backdrop, Box, Card, Loader, Text } from "astralis-ui";

// The scrim is position:fixed by design; the demo scopes it to a frame by
// overriding to absolute inside a relative container.
export function BackdropDemo() {
  return (
    <Box position="relative" w="full" maxW="md" overflow="hidden" rounded="lg">
      <Card>
        <Card.Body>
          <Text size="sm">Content that is busy loading sits behind the scrim.</Text>
        </Card.Body>
      </Card>
      <Backdrop style={{ position: "absolute" }}>
        <Loader colorScheme="gray" />
      </Backdrop>
    </Box>
  );
}
