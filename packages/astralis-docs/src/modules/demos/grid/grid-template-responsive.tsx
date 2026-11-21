import { Grid, Center, Text } from "astralis-ui";

export function GridTemplateResponsive() {
  return (
    /* One column on a phone; from md, a fluid column beside a fixed 10rem one. */
    <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1fr) 10rem" }} gap="3" w="full" maxW="md">
      <Center bg="purple-subtle" p="4" rounded="lg" minH="24">
        <Text size="sm">main</Text>
      </Center>
      <Center bg="purple-muted" p="4" rounded="lg">
        <Text size="sm">aside</Text>
      </Center>
    </Grid>
  );
}
