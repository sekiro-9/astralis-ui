import { Alert, Badge, Button, Grid, HStack, Progress, Stack, Tag, Text } from "astralis-ui";

const SECTIONS = [
  { scheme: "red", title: "Billing overdue" },
  { scheme: "teal", title: "Workspace healthy" },
] as const;

export function SectionColorScheme() {
  return (
    <Grid columns={{ base: "1", md: "2" }} gap="4" w="full">
      {SECTIONS.map(({ scheme, title }) => (
        <Stack key={scheme} colorScheme={scheme} gap="3" p="4" rounded="lg" border="normal" borderColor="subtle">
          <HStack gap="2">
            <Text as="span" weight="semibold">{title}</Text>
            <Badge colorScheme="inherit">{scheme}</Badge>
            <Badge>own default</Badge>
          </HStack>
          <Progress value={64} colorScheme="inherit" aria-label="Usage" />
          <Alert colorScheme="inherit">
            <Alert.Title>Every part here asked for inherit</Alert.Title>
          </Alert>
          <HStack gap="2">
            <Button size="sm" colorScheme="inherit">Act</Button>
            <Tag colorScheme="inherit">tag</Tag>
          </HStack>
        </Stack>
      ))}
    </Grid>
  );
}
